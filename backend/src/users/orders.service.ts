import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  DeepPartial,
  EntityManager,
  In,
  Repository,
} from 'typeorm';
import { orders, OrderStatus } from './orders.entity';
import { ReportService } from '../report/report.service';
import {
  CreateOrderDto,
  CreateOrderItemDto,
  UpdateOrderDto,
} from './dto/orders.dto';
import { orderItems } from './order-items.entity';
import { Product } from '../product/product.entity';
import { Customer, CustomerStatus } from '../customer/customer.entity';
import { users } from './users.entity';

type ReportServiceWithUpdate = ReportService & {
  updateForOrder(order: orders): Promise<unknown>;
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(orders)
    private readonly ordersRepository: Repository<orders>,
    @InjectRepository(orderItems)
    private readonly orderItemsRepository: Repository<orderItems>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(users)
    private readonly usersRepository: Repository<users>,
    private readonly dataSource: DataSource,
    private readonly reportService: ReportService,
  ) {}

  private generateOrderCode() {
    return `ORD-${Date.now().toString(36).toUpperCase()}`;
  }

  private resolveStockStatus(stock: number) {
    if (stock <= 0) {
      return 'Out of Stock';
    }

    if (stock < 10) {
      return 'Low Stock';
    }

    return 'In Stock';
  }

  private getPeriodStart(period: 'week' | 'month') {
    const now = new Date();

    if (period === 'week') {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return start;
    }

    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  private async ensureCustomerProfile(
    customerId: number,
    manager?: EntityManager,
  ) {
    const customerRepository = manager
      ? manager.getRepository(Customer)
      : this.customerRepository;
    const usersRepository = manager
      ? manager.getRepository(users)
      : this.usersRepository;

    const existingCustomer = await customerRepository.findOne({
      where: { user_id: customerId },
    });

    if (existingCustomer) {
      return existingCustomer.user_id;
    }

    const user = await usersRepository.findOne({ where: { id: customerId } });
    if (!user) {
      throw new BadRequestException(
        'Invalid customer id. Please log in again.',
      );
    }

    const createdCustomer = this.customerRepository.create({
      user_id: user.id,
      name: user.name || 'Unknown',
      phone: user.phone || 'Unknown',
      status: CustomerStatus.ACTIVE,
    });

    await customerRepository.save(createdCustomer);
    return createdCustomer.user_id;
  }

  private async saveOrderForProvider(
    customerId: number,
    providerId: number,
    items: CreateOrderItemDto[],
    orderCode?: string,
    status: OrderStatus = OrderStatus.PENDING,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const orderRepository = manager.getRepository(orders);
      const orderItemsRepository = manager.getRepository(orderItems);
      const productRepository = manager.getRepository(Product);

      const resolvedCustomerId = await this.ensureCustomerProfile(
        customerId,
        manager,
      );

      const normalizedItemsMap = new Map<number, number>();
      for (const item of items) {
        const quantity = Number(item.quantity);
        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new BadRequestException(
            'Each item quantity must be greater than 0',
          );
        }

        normalizedItemsMap.set(
          item.product_id,
          (normalizedItemsMap.get(item.product_id) || 0) + quantity,
        );
      }

      const normalizedItems = Array.from(normalizedItemsMap.entries()).map(
        ([product_id, quantity]) => ({ product_id, quantity }),
      );

      const productIds = normalizedItems.map((item) => item.product_id);
      const products = await productRepository.find({
        where: { id: In(productIds) },
        relations: ['provider'],
      });

      if (products.length !== productIds.length) {
        throw new NotFoundException('One or more products were not found');
      }

      const productsById = new Map(
        products.map((product) => [product.id, product] as [number, Product]),
      );

      const resolvedProviderId = products[0].provider?.user_id;
      if (!resolvedProviderId) {
        throw new BadRequestException('Product provider is missing');
      }

      for (const product of products) {
        if (product.provider?.user_id !== resolvedProviderId) {
          throw new BadRequestException(
            'Checkout can only contain products from one provider at a time',
          );
        }
      }

      if (providerId && providerId !== resolvedProviderId) {
        throw new BadRequestException(
          'Provider does not match the selected products',
        );
      }

      for (const item of normalizedItems) {
        const product = productsById.get(item.product_id);
        if (!product) {
          throw new NotFoundException('One or more products were not found');
        }

        const currentStock = Number(product.stock ?? 0);
        if (currentStock < item.quantity) {
          throw new BadRequestException(
            `${product.name} only has ${currentStock} kg available`,
          );
        }
      }

      const total = normalizedItems.reduce((sum, item) => {
        const product = productsById.get(item.product_id);
        if (!product) return sum;
        return sum + Number(product.price) * Number(item.quantity);
      }, 0);

      // Calculate admin profit (platform commission). Default 3% of order total.
      const adminProfit = Number((total * 0.03).toFixed(2));

      const order = orderRepository.create({
        order_code: orderCode || this.generateOrderCode(),
        customer_id: resolvedCustomerId,
        provider_id: resolvedProviderId,
        status,
        total,
        admin_profit: adminProfit,
        item: normalizedItems.reduce(
          (sum, item) => sum + Number(item.quantity),
          0,
        ),
        completed_at:
          status === OrderStatus.DELIVERING ? new Date() : undefined,
      } as DeepPartial<orders>);

      const savedOrder = await orderRepository.save(order);

      const orderItemEntities = normalizedItems.map((item) => {
        const product = productsById.get(item.product_id);
        return orderItemsRepository.create({
          order_id: savedOrder.id,
          product_id: item.product_id,
          quantity: String(item.quantity),
          price: Number(product?.price ?? 0),
        });
      });

      await orderItemsRepository.save(orderItemEntities);

      for (const item of normalizedItems) {
        const product = productsById.get(item.product_id)!;
        product.stock = Number(product.stock ?? 0) - item.quantity;
        product.status = this.resolveStockStatus(Number(product.stock ?? 0));
      }

      await productRepository.save(products);

      try {
        const savedOrderWithRelations = await orderRepository.findOne({
          where: { id: savedOrder.id },
          relations: [
            'provider',
            'customer',
            'order_items',
            'order_items.product',
          ],
        });

        if (savedOrderWithRelations) {
          await (this.reportService as ReportServiceWithUpdate).updateForOrder(
            savedOrderWithRelations,
          );
        }
      } catch (err) {
        console.error('Failed to update report for created order:', err);
      }

      return orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: [
          'provider',
          'customer',
          'order_items',
          'order_items.product',
        ],
      });
    });
  }

  // Create a new order
  async create(createOrderDto: CreateOrderDto) {
    try {
      if (createOrderDto.items?.length) {
        const createdOrder = await this.saveOrderForProvider(
          createOrderDto.customer_id,
          createOrderDto.provider_id ?? 0,
          createOrderDto.items,
          createOrderDto.order_code,
          createOrderDto.status ?? OrderStatus.PENDING,
        );

        return {
          message: 'Order created successfully!',
          data: createdOrder,
        };
      }

      const resolvedCustomerId = await this.ensureCustomerProfile(
        createOrderDto.customer_id,
      );

      const order = this.ordersRepository.create({
        ...createOrderDto,
        customer_id: resolvedCustomerId,
        status: createOrderDto.status as OrderStatus,
      });
      const savedOrder = await this.ordersRepository.save(order);

      try {
        const savedOrderWithRelations = await this.ordersRepository.findOne({
          where: { id: savedOrder.id },
          relations: [
            'provider',
            'customer',
            'order_items',
            'order_items.product',
          ],
        });

        if (savedOrderWithRelations) {
          await (this.reportService as ReportServiceWithUpdate).updateForOrder(
            savedOrderWithRelations,
          );
        }
      } catch (err) {
        console.error('Failed to update report for created order:', err);
      }

      return {
        message: 'Order created successfully!',
        data: savedOrder,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Error creating order',
      );
    }
  }

  // Get all orders
  async findAll() {
    return this.ordersRepository.find({
      relations: ['provider', 'customer', 'order_items', 'order_items.product'],
    });
  }

  // Get order by ID
  async findOne(id: number) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['provider', 'customer', 'order_items', 'order_items.product'],
    });
    if (!order) {
      return { message: 'Order not found.' };
    }
    return order;
  }

  // Get orders by provider ID
  async findByProvider(providerId: number) {
    return this.ordersRepository.find({
      where: { provider_id: providerId },
      relations: ['provider', 'customer', 'order_items', 'order_items.product'],
    });
  }

  // Provider revenue summary
  async getProviderRevenue(providerId: number) {
    const providerOrders = await this.ordersRepository.find({
      where: { provider_id: providerId },
      relations: ['provider', 'customer', 'order_items', 'order_items.product'],
      order: { created_at: 'DESC' },
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthLabels = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const monthlyRevenue = Array.from({ length: 12 }, (_, monthIndex) => {
      const monthTotal = providerOrders
        .filter((order) => {
          const referenceDate = new Date(order.created_at);
          return (
            referenceDate.getFullYear() === currentYear &&
            referenceDate.getMonth() === monthIndex
          );
        })
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

      return {
        month: monthLabels[monthIndex],
        value: Number(monthTotal.toFixed(2)),
      };
    });

    const monthOrders = providerOrders.filter((order) => {
      const referenceDate = new Date(order.created_at);
      return (
        referenceDate.getMonth() === currentMonth &&
        referenceDate.getFullYear() === currentYear
      );
    });

    const totalRevenue = providerOrders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0,
    );

    const monthRevenue = monthOrders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0,
    );

    const recentOrders = providerOrders.slice(0, 5).map((order) => {
      const items = order.order_items || [];
      const firstItem = items[0]?.product?.name || 'Product';
      const itemLabel =
        items.length > 1
          ? `${firstItem} + ${items.length - 1} more`
          : firstItem;

      return {
        id: order.order_code || `#O${order.id}`,
        orderId: order.id,
        product: itemLabel,
        quantity: `${order.item || items.length || 1} item${Number(order.item || items.length || 1) === 1 ? '' : 's'}`,
        date: order.created_at,
        status: order.status,
        total: Number(order.total || 0),
        customerName: order.customer?.name || `Customer ${order.customer_id}`,
      };
    });

    return {
      providerId,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      monthRevenue: Number(monthRevenue.toFixed(2)),
      totalOrders: providerOrders.length,
      revenueOrders: providerOrders.length,
      monthOrders: monthOrders.length,
      pendingOrders: providerOrders.filter(
        (order) => order.status === OrderStatus.PENDING,
      ).length,
      monthlyRevenue,
      recentOrders,
    };
  }

  // Get orders by customer ID
  async findByCustomer(customerId: number) {
    return this.ordersRepository.find({
      where: { customer_id: customerId },
      relations: ['provider', 'customer', 'order_items', 'order_items.product'],
    });
  }

  async getTopSellingProducts(
    period: 'week' | 'month' = 'week',
    providerId?: number,
    customerId?: number,
  ) {
    const periodStart = this.getPeriodStart(period);

    const orders = await this.ordersRepository.find({
      where: providerId
        ? { provider_id: providerId }
        : customerId
          ? { customer_id: customerId }
          : undefined,
      relations: ['order_items', 'order_items.product'],
      order: { created_at: 'DESC' },
    });

    const filteredOrders = orders.filter((order) => {
      if (!order.created_at) return false;
      const orderDate = new Date(order.created_at);
      return orderDate >= periodStart;
    });

    const productStats = new Map<
      number,
      {
        id: number;
        name: string;
        imageUrl: string | null;
        category: string;
        price: number;
        totalQuantity: number;
        orderCount: number;
      }
    >();

    for (const order of filteredOrders) {
      const seenInOrder = new Set<number>();

      for (const item of order.order_items || []) {
        const product = item.product;
        if (!product) continue;

        const quantity = Number(item.quantity || 0);
        if (!quantity) continue;

        const existing = productStats.get(product.id) || {
          id: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          category: product.category,
          price: Number(product.price || 0),
          totalQuantity: 0,
          orderCount: 0,
        };

        existing.totalQuantity += quantity;
        if (!seenInOrder.has(product.id)) {
          existing.orderCount += 1;
          seenInOrder.add(product.id);
        }

        productStats.set(product.id, existing);
      }
    }

    const periodRevenue = filteredOrders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0,
    );

    const products = Array.from(productStats.values())
      .sort((left, right) => {
        if (right.totalQuantity !== left.totalQuantity) {
          return right.totalQuantity - left.totalQuantity;
        }

        return right.orderCount - left.orderCount;
      })
      .map((product, index) => ({
        ...product,
        rank: index + 1,
      }));

    return {
      period,
      providerId: providerId ?? null,
      customerId: customerId ?? null,
      totalOrders: filteredOrders.length,
      periodRevenue: Number(periodRevenue.toFixed(2)),
      products,
    };
  }

  // Update order
  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      return { message: 'Order not found.' };
    }

    Object.assign(order, updateOrderDto);
    if (
      updateOrderDto.status === OrderStatus.DELIVERING &&
      !order.completed_at
    ) {
      order.completed_at = new Date();
    }
    const saved = await this.ordersRepository.save(order);

    return {
      message: 'Order updated successfully!',
      data: saved,
    };
  }

  // Delete order
  async remove(id: number) {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      return { message: 'Order not found.' };
    }

    await this.ordersRepository.delete(id);
    return {
      message: 'Order deleted successfully!',
    };
  }
}
