import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { orders, OrderStatus, PaymentStatus } from './orders.entity';
import { orderItems } from './order-items.entity';
import { Product } from '../product/product.entity';
import { Customer } from '../customer/customer.entity';import { ReportService } from '../report/report.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/orders.dto';

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

    private readonly reportService: ReportService,
    private dataSource: DataSource,
  ) {}

  // =========================
  // CREATE ORDER
  // =========================
async create(dto: CreateOrderDto, paymentProof?: string) {
  return this.dataSource.transaction(async (manager) => {
    const orderRepo = manager.getRepository(orders);
    const itemRepo = manager.getRepository(orderItems);
    const productRepo = manager.getRepository(Product);

    const items = dto.items ?? [];

    if (items.length === 0) {
      throw new BadRequestException('Order must have items');
    }

    const productIds = items.map(i => i.product_id);

    const products = await productRepo.find({
      where: { id: In(productIds) },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('Some products not found');
    }

    const productMap = new Map(products.map(p => [p.id, p]));

    let total = 0;

    for (const item of items) {
      const product = productMap.get(item.product_id);

      if (!product) continue;

      if (Number(product.stock) < item.quantity) {
        throw new BadRequestException(`${product.name} out of stock`);
      }

      total += Number(product.price) * item.quantity;
    }

    const order = orderRepo.create({
      order_code: `ORD-${Date.now()}`,
      customer_id: dto.customer_id,
      provider_id: dto.provider_id,
      status: OrderStatus.PENDING,
      total,
      payment_method: dto.payment_method,
      payment_status: dto.payment_status ?? PaymentStatus.PENDING,
      payment_proof: paymentProof ?? null,
    });

    const savedOrder = await orderRepo.save(order);

    const orderItemsEntities = items.map(i =>
      itemRepo.create({
        order: { id: savedOrder.id },
        product: { id: i.product_id },
        quantity: i.quantity,
        price: productMap.get(i.product_id)!.price,
      }),
    );

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
  // PROVIDER REVENUE SUMMARY
  // =========================
  async getProviderRevenue(providerId: number) {
    const orders = await this.ordersRepo.find({
      where: { provider_id: providerId },
      order: { id: 'DESC' },
    });

    const totalOrders = orders.length
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0,
    )
    const pendingOrders = orders.filter((order) => order.status === OrderStatus.PENDING).length
    const completedOrders = orders.filter((order) => order.status === OrderStatus.COMPLETED).length

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const monthOrders = orders.filter((order) => {
      const created = new Date(order.created_at)
      return (
        created.getFullYear() === currentYear &&
        created.getMonth() === currentMonth
      )
    })
    const monthRevenue = monthOrders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0,
    )

    return {
      totalOrders,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      pendingOrders,
      completedOrders,
      monthOrders: monthOrders.length,
      monthRevenue: Number(monthRevenue.toFixed(2)),
      revenueOrders: totalOrders,
    }
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
}