import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';

import { orders, OrderStatus, PaymentStatus } from './orders.entity';
import {
  CreateOrderDto,
  CreateOrderItemDto,
  UpdateOrderDto,
} from './dto/orders.dto';

import { orderItems } from './order-items.entity';
import { Product } from '../product/product.entity';
import { Customer, CustomerStatus } from '../customer/customer.entity';
import { users } from './users.entity';

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
  ) {}

  // =========================
  // GENERATE ORDER CODE
  // =========================
  private generateOrderCode() {
    return `ORD-${Date.now().toString(36).toUpperCase()}`;
  }

  // =========================
  // ENSURE CUSTOMER PROFILE
  // =========================
  private async ensureCustomerProfile(customerId: number) {
    const existingCustomer = await this.customerRepository.findOne({
      where: { user_id: customerId },
    });

    if (existingCustomer) {
      return existingCustomer.user_id;
    }

    const user = await this.usersRepository.findOne({
      where: { id: customerId },
    });

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

    await this.customerRepository.save(createdCustomer);

    return createdCustomer.user_id;
  }

  // =========================
  // SAVE ORDER FOR PROVIDER
  // =========================
  private async saveOrderForProvider(
    customerId: number,
    providerId: number,
    items: CreateOrderItemDto[],
    orderCode?: string,
    status: OrderStatus = OrderStatus.PENDING,
  ) {
    const resolvedCustomerId = await this.ensureCustomerProfile(customerId);

    // get all product ids
    const productIds = items.map((item) => item.product_id);

    // find products
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: ['provider'],
    });

    // check missing product
    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products were not found');
    }

    // map products
    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );

    // get provider from first product
    const resolvedProviderId = products[0].provider?.user_id;

    if (!resolvedProviderId) {
      throw new BadRequestException('Product provider is missing');
    }

    // ensure all products belong to same provider
    for (const product of products) {
      if (product.provider?.user_id !== resolvedProviderId) {
        throw new BadRequestException(
          'Checkout can only contain products from one provider at a time',
        );
      }
    }

    // validate provider
    if (providerId && providerId !== resolvedProviderId) {
      throw new BadRequestException(
        'Provider does not match the selected products',
      );
    }

    // calculate total
    const total = items.reduce((sum, item) => {
      const product = productsById.get(item.product_id);

      if (!product) return sum;

      return sum + Number(product.price) * Number(item.quantity);
    }, 0);

    // create order
    const order = this.ordersRepository.create({
      order_code: orderCode || this.generateOrderCode(),
      customer_id: resolvedCustomerId,
      provider_id: resolvedProviderId,
      status,
      total,
      item: items.reduce((sum, item) => sum + Number(item.quantity), 0),
      completed_at: status === OrderStatus.DELIVERING ? new Date() : undefined,
    } as DeepPartial<orders>);

    // save order
    const savedOrder = await this.ordersRepository.save(order);

    // create order items
    const orderItemEntities = items.map((item) => {
      const product = productsById.get(item.product_id);

      return this.orderItemsRepository.create({
        order_id: savedOrder.id,
        product_id: item.product_id,
        quantity: String(item.quantity),
        price: Number(product?.price ?? 0),
      });
    });

    // save order items
    await this.orderItemsRepository.save(orderItemEntities);

    // return order with relations
    return this.ordersRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['provider', 'customer', 'order_items', 'order_items.product'],
    });
  }

  // =========================
  // CREATE ORDER
  // =========================
  async create(createOrderDto: CreateOrderDto) {
    try {
      // if order has items
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

      // ensure customer exists
      const resolvedCustomerId = await this.ensureCustomerProfile(
        createOrderDto.customer_id,
      );

      // create order
      const order = this.ordersRepository.create({
        ...createOrderDto,
        customer_id: resolvedCustomerId,
        status: createOrderDto.status as OrderStatus,
      });

      // save order
      const savedOrder = await this.ordersRepository.save(order);

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

  // =========================
  // GET ALL ORDERS
  // =========================
  async findAll() {
    return this.ordersRepository.find({
      relations: ['provider', 'customer', 'order_items', 'order_items.product'],
    });
  }

  // =========================
  // GET ORDER BY ID
  // =========================
  async findOne(id: number) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['provider', 'customer', 'order_items', 'order_items.product'],
    });

    if (!order) {
      return {
        message: 'Order not found.',
      };
    }

    return order;
  }

  // =========================
  // GET ORDERS BY PROVIDER
  // =========================
  async findByProvider(providerId: number) {
    return this.ordersRepository.find({
      where: { provider_id: providerId },
      relations: ['provider', 'customer', 'order_items', 'order_items.product'],
    });
  }

  // =========================
  // GET ORDERS BY CUSTOMER
  // =========================
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
  async findByCustomer(customerId: number) {
    return this.ordersRepository.find({
      where: { customer_id: customerId },
      relations: ['provider', 'customer', 'order_items', 'order_items.product'],
    });
  }

  // =========================
  // UPDATE ORDER
  // =========================
  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.ordersRepository.findOne({
      where: { id },
    });

    if (!order) {
      return {
        message: 'Order not found.',
      };
    }

    Object.assign(order, updateOrderDto);

    // if delivering -> set completed_at
    if (
      updateOrderDto.status === OrderStatus.DELIVERING &&
      !order.completed_at
    ) {
      order.completed_at = new Date();
    }

    await this.ordersRepository.save(order);

    return {
      message: 'Order updated successfully!',
      data: order,
    };
  }
  // Upload payment proof
  async uploadPaymentProof(orderId: number, filename: string) {
    const order = await this.ordersRepository.findOne({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.payment_proof = '/uploads/payment-proofs/' + filename;

    order.payment_status = PaymentStatus.PAID;

    return await this.ordersRepository.save(order);
  }
  // =========================
  // UPDATE ORDER STATUS ONLY
  // =========================
  async updateStatus(id: number, status: string) {
    const order = await this.ordersRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // update status
    order.status = status as OrderStatus;

    // set completed date
    if (status === 'completed') {
      order.completed_at = new Date();
    }

    // save
    await this.ordersRepository.save(order);

    return {
      message: 'Order status updated successfully!',
      data: order,
    };
  }

  // =========================
  // DELETE ORDER
  // =========================
  async remove(id: number) {
    const order = await this.ordersRepository.findOne({
      where: { id },
    });

    if (!order) {
      return {
        message: 'Order not found.',
      };
    }

    await this.ordersRepository.delete(id);

    return {
      message: 'Order deleted successfully!',
    };
  }
}
