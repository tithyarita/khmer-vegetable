import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

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
  private generateOrderCode(): string {
    return `ORD-${Date.now().toString(36).toUpperCase()}`;
  }

  // =========================
  // ENSURE CUSTOMER PROFILE
  // =========================
  private async ensureCustomerProfile(customerId: number): Promise<number> {
    const existing = await this.customerRepository.findOne({
      where: { user_id: customerId },
    });
    if (existing) return existing.user_id;

    const user = await this.usersRepository.findOne({
      where: { id: customerId },
    });
    if (!user) {
      throw new BadRequestException(
        'Invalid customer id. Please log in again.',
      );
    }

    const created = this.customerRepository.create({
      user_id: user.id,
      name: user.name || 'Unknown',
      phone: user.phone || 'Unknown',
      status: CustomerStatus.ACTIVE,
    });
    await this.customerRepository.save(created);

    return created.user_id;
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
    payment_method?: string,
    payment_status?: PaymentStatus,
    payment_proof?: string,
  ): Promise<orders | null> {
    const resolvedCustomerId = await this.ensureCustomerProfile(customerId);
    const productIds = items.map((i) => i.product_id);

    const products = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: ['provider'],
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products were not found');
    }

    const productsById = new Map(products.map((p) => [p.id, p]));
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

    const total = items.reduce((sum, item) => {
      const product = productsById.get(item.product_id);
      return product
        ? sum + Number(product.price) * Number(item.quantity)
        : sum;
    }, 0);

    const order = this.ordersRepository.create({
      order_code: orderCode || this.generateOrderCode(),
      customer_id: resolvedCustomerId,
      provider_id: resolvedProviderId,
      status,
      total,
      item: items.reduce((sum, i) => sum + Number(i.quantity), 0),
      payment_method: payment_method || 'cash',
      payment_status: payment_status ?? PaymentStatus.PENDING,
      payment_proof: payment_proof || undefined,
      completed_at: status === OrderStatus.COMPLETED ? new Date() : undefined,
    });

    const saved = await this.ordersRepository.save(order);

    const itemEntities = items.map((item) => {
      const product = productsById.get(item.product_id);
      return this.orderItemsRepository.create({
        order_id: saved.id,
        product_id: item.product_id,
        quantity: String(item.quantity),
        price: Number(product?.price ?? 0),
      });
    });

    await this.orderItemsRepository.save(itemEntities);

    return this.ordersRepository.findOne({
      where: { id: saved.id },
      relations: ['provider', 'customer', 'order_items', 'order_items.product'],
    });
  }

  // =========================
  // CREATE ORDER
  // =========================
  async create(createOrderDto: CreateOrderDto, paymentProofPath?: string) {
    try {
      const finalProof = paymentProofPath || createOrderDto.payment_proof;

      if (createOrderDto.items?.length) {
        const created = await this.saveOrderForProvider(
          Number(createOrderDto.customer_id),
          createOrderDto.provider_id ? Number(createOrderDto.provider_id) : 0,
          createOrderDto.items,
          createOrderDto.order_code,
          createOrderDto.status,
          createOrderDto.payment_method,
          createOrderDto.payment_status,
          finalProof,
        );
        return { message: 'Order created successfully!', data: created };
      }

      const resolvedCustomerId = await this.ensureCustomerProfile(
        Number(createOrderDto.customer_id),
      );

      const order = this.ordersRepository.create({
        ...createOrderDto,
        customer_id: resolvedCustomerId,
        payment_proof: finalProof || undefined,
        payment_status: createOrderDto.payment_status ?? PaymentStatus.PENDING,
      });

      const saved = await this.ordersRepository.save(order);
      return { message: 'Order created successfully!', data: saved };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Error creating order',
      );
    }
  }

  // =========================
  // FIND ALL
  // =========================
  async findAll(): Promise<orders[]> {
    return this.ordersRepository.find({
      relations: ['provider', 'customer', 'order_items', 'order_items.product'],
    });
  }

  // =========================
  // FIND ONE
  // =========================
  async findOne(id: number): Promise<orders | null> {
    return this.ordersRepository.findOne({
      where: { id },
      relations: ['provider', 'customer', 'order_items', 'order_items.product'],
    });
  }

  // =========================
  // FIND BY PROVIDER
  // =========================
  async findByProvider(providerId: number): Promise<orders[]> {
    return this.ordersRepository.find({
      where: { provider_id: providerId },
      relations: ['provider', 'customer', 'order_items', 'order_items.product'],
    });
  }

  // =========================
  // FIND BY CUSTOMER
  // =========================
  async findByCustomer(customerId: number): Promise<orders[]> {
    return this.ordersRepository.find({
      where: { customer_id: customerId },
      relations: ['provider', 'customer', 'order_items', 'order_items.product'],
    });
  }

  // =========================
  // UPDATE ORDER
  // =========================
  async update(
    id: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<{ message: string; data: orders }> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    Object.assign(order, updateOrderDto);
    await this.ordersRepository.save(order);

    return { message: 'Order updated successfully!', data: order };
  }

  // =========================
  // UPDATE STATUS
  // =========================
  async updateStatus(
    id: number,
    status: OrderStatus,
  ): Promise<{ message: string; data: orders }> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    order.status = status;
    if (status === OrderStatus.COMPLETED) {
      order.completed_at = new Date();
    }

    await this.ordersRepository.save(order);
    return { message: 'Order status updated!', data: order };
  }

  // =========================
  // DELETE ORDER
  // =========================
  async remove(id: number): Promise<{ message: string }> {
    await this.ordersRepository.delete(id);
    return { message: 'Order deleted successfully!' };
  }

  // =========================
  // UPLOAD PAYMENT PROOF
  // =========================
  async uploadPaymentProof(
    orderId: number,
    filename: string,
  ): Promise<{ message: string; payment_proof: string }> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const proofPath = `/images/payment-proofs/${filename}`;
    await this.ordersRepository.update(
      { id: orderId },
      { payment_proof: proofPath },
    );

    return {
      message: 'Payment proof uploaded successfully!',
      payment_proof: `http://localhost:3000${proofPath}`,
    };
  }

  // =========================
  // GET PROVIDER REVENUE
  // =========================
  async getProviderRevenue(providerId: number): Promise<{
    provider_id: number;
    completed_orders_count: number;
    total_revenue: number;
  }> {
    const completedOrders = await this.ordersRepository.find({
      where: { provider_id: providerId, status: OrderStatus.COMPLETED },
    });

    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0,
    );

    return {
      provider_id: providerId,
      completed_orders_count: completedOrders.length,
      total_revenue: totalRevenue,
    };
  }
}
