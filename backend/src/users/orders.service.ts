import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';

import { orders, OrderStatus, PaymentStatus } from './orders.entity';
import { orderItems } from './order-items.entity';
import { Product } from '../product/product.entity';
import { Customer, CustomerStatus } from '../customer/customer.entity';
import { users } from '../users/users.entity';
import { ReportService } from '../report/report.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/orders.dto';

type OrderCheckoutFees = {
  shippingFee?: number;
  serviceFee?: number;
  grandTotal?: number;
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(orders)
    private ordersRepo: Repository<orders>,

    @InjectRepository(orderItems)
    private orderItemsRepo: Repository<orderItems>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    @InjectRepository(users)
    private usersRepo: Repository<users>,

    private readonly reportService: ReportService,
    private dataSource: DataSource,
  ) {}

  private roundMoney(value: number): number {
    return Math.round(Number(value || 0) * 100) / 100;
  }

  private getDiscountedUnitPrice(product: Product): number {
    const base = Number(product.price || 0);
    const discount = Number(product.discount || 0);
    return this.roundMoney(base * (1 - discount / 100));
  }

  private resolveItemUnitPrice(
    product: Product,
    item: { unit_price?: number; price?: number },
  ): number {
    const passed = Number(item.unit_price ?? item.price ?? 0);
    if (passed > 0) return this.roundMoney(passed);
    return this.getDiscountedUnitPrice(product);
  }

  private calculateItemsSubtotal(
    items: Array<{ product_id: number; quantity: number; unit_price?: number; price?: number }>,
    productMap: Map<number, Product>,
  ): number {
    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) continue;
      const unitPrice = this.resolveItemUnitPrice(product, item);
      subtotal += unitPrice * Number(item.quantity || 0);
    }

    return this.roundMoney(subtotal);
  }

  private async ensureCustomerExists(customerId: number) {
    const customer = await this.customerRepo.findOne({
      where: { user_id: customerId },
    });

    if (customer) return customer;

    // Try to create a Customer record based on existing users table
    const user = await this.usersRepo.findOne({ where: { id: customerId } });
    if (!user) {
      throw new BadRequestException(
        `Customer record not found for user id ${customerId}. Please register or contact support.`,
      );
    }

    const newCustomer = this.customerRepo.create({
      user_id: customerId,
      name: user.name || 'Customer',
      phone: user.phone ?? undefined,
      status: CustomerStatus.ACTIVE,
    });

    try {
      return await this.customerRepo.save(newCustomer);
    } catch (err) {
      console.error('Failed to auto-create customer record:', err);
      throw new BadRequestException(
        `Customer record not found for user id ${customerId}. Please register or contact support.`,
      );
    }
  }

  private async getExistingCustomer(customerId: number) {
    const customer = await this.customerRepo.findOne({
      where: { user_id: customerId },
    });

    if (!customer) {
      throw new BadRequestException(
        `Customer record not found for user id ${customerId}. Please register or contact support.`,
      );
    }

    return customer;
  }

  // =========================
  // CREATE ORDER
  // =========================
  async create(
    dto: CreateOrderDto,
    paymentProof?: string,
    fees: OrderCheckoutFees = {},
  ) {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(orders);
      const itemRepo = manager.getRepository(orderItems);
      const productRepo = manager.getRepository(Product);

      const items = dto.items ?? [];

      if (items.length === 0) {
        throw new BadRequestException('Order must have items');
      }

      const productIds = items.map((i) => i.product_id);

      const products = await productRepo.find({
        where: { id: In(productIds) },
      });

      if (products.length !== productIds.length) {
        throw new NotFoundException('Some products not found');
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      const shippingFee = this.roundMoney(fees.shippingFee || 0);
      const serviceFee = this.roundMoney(fees.serviceFee || 0);
      const itemsSubtotal = this.calculateItemsSubtotal(items, productMap);
      const total = this.roundMoney(itemsSubtotal + shippingFee + serviceFee);
      const grandTotal = this.roundMoney(fees.grandTotal || total);

      for (const item of items) {
        const product = productMap.get(item.product_id);

        if (!product) continue;

        if (Number(product.stock) < item.quantity) {
          throw new BadRequestException(`${product.name} out of stock`);
        }
      }

      await this.ensureCustomerExists(dto.customer_id);

      const order = orderRepo.create({
        order_code: `ORD-${Date.now()}`,
        customer_id: dto.customer_id,
        provider_id: dto.provider_id,
        status: OrderStatus.PENDING,
        subtotal: itemsSubtotal,
        shipping_fee: shippingFee,
        service_fee: serviceFee,
        total,
        payment_amount: grandTotal,
        item: items.length,
        payment_method: dto.payment_method,
        payment_status: dto.payment_status ?? PaymentStatus.PENDING,
        payment_proof: paymentProof ?? null,
      });

      const savedOrder = await orderRepo.save(order);

      const orderItemsEntities = items.map((i) => {
        const product = productMap.get(i.product_id)!;
        return itemRepo.create({
          order: { id: savedOrder.id },
          product: { id: i.product_id },
          quantity: i.quantity,
          price: this.resolveItemUnitPrice(product, i),
        });
      });

      await itemRepo.save(orderItemsEntities);

      for (const item of items) {
        const product = productMap.get(item.product_id);
        if (product) {
          product.stock = Number(product.stock) - item.quantity;
        }
      }

      await productRepo.save(products);

      try {
        await this.reportService.updateForOrder(savedOrder);
      } catch (error) {
        console.error('Failed to update report after order creation:', error);
      }

      return {
        message: 'Order created successfully',
        data: savedOrder,
      };
    });
  }

  async createMany(
    dtos: CreateOrderDto[],
    paymentProof?: string,
    fees: OrderCheckoutFees = {},
  ) {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(orders);
      const itemRepo = manager.getRepository(orderItems);
      const productRepo = manager.getRepository(Product);

      const allItems = dtos.flatMap((dto) => dto.items ?? []);

      if (allItems.length === 0) {
        throw new BadRequestException('Order must have items');
      }

      if (dtos.length === 0) {
        throw new BadRequestException('No orders provided');
      }

      await this.ensureCustomerExists(dtos[0].customer_id);

      const productIds = [...new Set(allItems.map((i) => i.product_id))];

      const products = await productRepo.find({
        where: { id: In(productIds) },
      });

      if (products.length !== productIds.length) {
        throw new NotFoundException('Some products not found');
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      const totalQuantities = new Map<number, number>();
      for (const item of allItems) {
        if (!item.product_id || item.quantity <= 0) continue;
        totalQuantities.set(
          item.product_id,
          (totalQuantities.get(item.product_id) || 0) + item.quantity,
        );
      }

      for (const [productId, quantity] of totalQuantities.entries()) {
        const product = productMap.get(productId);
        if (!product) continue;
        if (Number(product.stock) < quantity) {
          throw new BadRequestException(`${product.name} out of stock`);
        }
      }

      const savedOrders = [] as any[];
      const shippingFee = this.roundMoney(fees.shippingFee || 0);
      const serviceFee = this.roundMoney(fees.serviceFee || 0);
      const combinedFees = this.roundMoney(shippingFee + serviceFee);
      const grandTotal = this.roundMoney(fees.grandTotal || 0);

      for (let index = 0; index < dtos.length; index++) {
        const dto = dtos[index];
        const items = dto.items ?? [];
        const itemsSubtotal = this.calculateItemsSubtotal(items, productMap);
        const orderFees = index === 0 ? combinedFees : 0;
        const total = this.roundMoney(itemsSubtotal + orderFees);
        const paymentAmount =
          grandTotal > 0 && index === 0 ? grandTotal : total;

        const order = orderRepo.create({
          order_code: `ORD-${Date.now()}-${dto.provider_id || '0'}`,
          customer_id: dto.customer_id,
          provider_id: dto.provider_id,
          status: dto.status ?? OrderStatus.PENDING,
          subtotal: itemsSubtotal,
          shipping_fee: index === 0 ? shippingFee : 0,
          service_fee: index === 0 ? serviceFee : 0,
          total,
          payment_amount: paymentAmount,
          item: items.length,
          payment_method: dto.payment_method,
          payment_status: dto.payment_status ?? PaymentStatus.PENDING,
          payment_proof: paymentProof ?? null,
        });

        const savedOrder = await orderRepo.save(order);

        const orderItemsEntities = items.map((item) => {
          const product = productMap.get(item.product_id)!;
          return itemRepo.create({
            order: { id: savedOrder.id },
            product: { id: item.product_id },
            quantity: item.quantity,
            price: this.resolveItemUnitPrice(product, item),
          });
        });

        await itemRepo.save(orderItemsEntities);
        savedOrders.push(savedOrder);
      }

      for (const [productId, quantity] of totalQuantities.entries()) {
        const product = productMap.get(productId);
        if (!product) continue;
        product.stock = Number(product.stock) - quantity;
      }

      await productRepo.save(products);

      for (const savedOrder of savedOrders) {
        try {
          await this.reportService.updateForOrder(savedOrder);
        } catch (error) {
          console.error('Failed to update report after order creation:', error);
        }
      }

      return {
        message: 'Orders created successfully',
        data: savedOrders,
      };
    });
  }
  // =========================
  // GET ALL
  // =========================
  async findAll() {
    return this.ordersRepo.find({
      relations: {
        order_items: { product: true },
        provider: true,
        customer: true,
      },
      order: { id: 'DESC' },
    });
  }

  // =========================
  // GET ONE
  // =========================
  async findOne(id: number) {
    return this.ordersRepo.findOne({
      where: { id },
      relations: {
        order_items: { product: true },
        provider: true,
        customer: true,
      },
    });
  }

  // =========================
  // BY PROVIDER
  // =========================
  async findByProvider(providerId: number) {
    return this.ordersRepo.find({
      where: { provider_id: providerId },
      relations: {
        order_items: { product: true },
        provider: true,
        customer: true,
      },
    });
  }

  // =========================
  // BY CUSTOMER
  // =========================
  async findByCustomer(customerId: number) {
    return this.ordersRepo.find({
      where: { customer_id: customerId },
      relations: {
        order_items: { product: true },
        provider: true,
        customer: true,
      },
      order: { id: 'DESC' },
    });
  }

  // =========================
  // PROVIDER REVENUE SUMMARY
  // =========================
  async getProviderRevenue(providerId: number, startDate?: string, endDate?: string) {
    let orders = await this.ordersRepo.find({
      where: { provider_id: providerId },
      order: { id: 'DESC' },
    });

    const ADMIN_FEE_RATE = 0.03; // 3%

    // Filter by date range if provided
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate + 'T23:59:59.999Z') : new Date('9999-12-31T23:59:59.999Z');
      orders = orders.filter((order) => {
        const created = new Date(order.created_at);
        return created >= start && created <= end;
      });
    }

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0,
    );
    const pendingOrders = orders.filter(
      (order) => order.status === OrderStatus.PENDING,
    ).length;
    const completedOrders = orders.filter(
      (order) => order.status === OrderStatus.COMPLETED,
    ).length;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const monthOrders = orders.filter((order) => {
      const created = new Date(order.created_at);
      return (
        created.getFullYear() === currentYear &&
        created.getMonth() === currentMonth
      );
    });
    const monthRevenue = monthOrders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0,
    );

    const totalAdminFee = Number((totalRevenue * ADMIN_FEE_RATE).toFixed(2));
    const totalProviderNet = Number((totalRevenue - totalAdminFee).toFixed(2));

    const monthAdminFee = Number((monthRevenue * ADMIN_FEE_RATE).toFixed(2));
    const monthProviderNet = Number((monthRevenue - monthAdminFee).toFixed(2));

    return {
      totalOrders,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalAdminFee,
      totalProviderNet,
      pendingOrders,
      completedOrders,
      monthOrders: monthOrders.length,
      monthRevenue: Number(monthRevenue.toFixed(2)),
      monthAdminFee,
      monthProviderNet,
      revenueOrders: totalOrders,
    };
  }

  // =========================
  // UPDATE
  // =========================
  async update(id: number, dto: UpdateOrderDto) {
    const order = await this.ordersRepo.findOne({ where: { id } });

    if (!order) throw new NotFoundException('Order not found');

    const oldOrder = { ...order } as any;

    Object.assign(order, dto);

    const saved = await this.ordersRepo.save(order);

    try {
      await this.reportService.adjustForOrderUpdate(oldOrder, saved as any);
    } catch (err) {
      console.error('Failed to adjust reports after order update:', err);
    }

    return saved;
  }

  // =========================
  // UPDATE STATUS
  // =========================
  async updateStatus(id: number, status: OrderStatus) {
    const order = await this.ordersRepo.findOne({ where: { id } });

    if (!order) throw new NotFoundException('Order not found');

    order.status = status;

    if (status === OrderStatus.COMPLETED && !order.completed_at) {
      order.completed_at = new Date();
    }

    return this.ordersRepo.save(order);
  }

  // =========================
  // DELETE
  // =========================
  async remove(id: number) {
    const order = await this.ordersRepo.findOne({ where: { id } });

    if (!order) throw new NotFoundException('Order not found');

    const toRemove = { ...order } as any;

    await this.ordersRepo.remove(order);

    try {
      await this.reportService.decrementForOrder(toRemove as any);
    } catch (err) {
      console.error('Failed to decrement report after order removal:', err);
    }

    return { message: 'Deleted successfully' };
  }

  // =========================
  // GET TOP PRODUCTS
  // =========================
  async getTopProducts(period?: string, providerId?: number) {
    const query = this.orderItemsRepo.createQueryBuilder('item')
      .innerJoin('item.product', 'product')
      .innerJoin('item.order', 'order')
      .select([
        'product.id AS id',
        'product.name AS name',
        'product.price AS price',
        'product.discount AS discount',
        'product.imageUrl AS imageUrl',
        'product.category AS category',
        'product.description AS description',
        'SUM(item.quantity) AS totalQuantity',
        'COUNT(DISTINCT order.id) AS orderCount',
      ])
      .groupBy('product.id')
      .orderBy('SUM(item.quantity)', 'DESC');

    if (providerId) {
      query.andWhere('order.provider_id = :providerId', { providerId });
    }

    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query.andWhere('order.created_at >= :weekAgo', { weekAgo });
    } else if (period === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      query.andWhere('order.created_at >= :startOfMonth', { startOfMonth });
    }

    const rawResults = await query.getRawMany();

    const products = rawResults.map((row, index) => ({
      id: Number(row.id),
      name: row.name,
      price: Number(row.price),
      discount: Number(row.discount || 0),
      imageUrl: row.imageUrl,
      image: row.imageUrl,
      category: row.category,
      description: row.description,
      totalQuantity: Number(row.totalQuantity || 0),
      orderCount: Number(row.orderCount || 0),
      rank: index + 1,
    }));

    return { products };
  }
}
