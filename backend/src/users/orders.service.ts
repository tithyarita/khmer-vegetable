import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { orders, OrderStatus } from './orders.entity';
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

  private generateOrderCode() {
    return `ORD-${Date.now().toString(36).toUpperCase()}`;
  }

  private async ensureCustomerProfile(customerId: number) {
    const existingCustomer = await this.customerRepository.findOne({
      where: { user_id: customerId },
    });

    if (existingCustomer) {
      return existingCustomer.user_id;
    }

    const user = await this.usersRepository.findOne({ where: { id: customerId } });
    if (!user) {
      throw new BadRequestException('Invalid customer id. Please log in again.');
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

  private async saveOrderForProvider(
    customerId: number,
    providerId: number,
    items: CreateOrderItemDto[],
    orderCode?: string,
    status: OrderStatus = OrderStatus.PENDING,
  ) {
    const resolvedCustomerId = await this.ensureCustomerProfile(customerId);

    const productIds = items.map((item) => item.product_id);
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: ['provider'],
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products were not found');
    }

    const productsById = new Map(products.map((product) => [product.id, product]));

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
      throw new BadRequestException('Provider does not match the selected products');
    }

    const total = items.reduce((sum, item) => {
      const product = productsById.get(item.product_id);
      if (!product) return sum;
      return sum + Number(product.price) * Number(item.quantity);
    }, 0);

    const order = this.ordersRepository.create({
      order_code: orderCode || this.generateOrderCode(),
      customer_id: resolvedCustomerId,
      provider_id: resolvedProviderId,
      status,
      total,
      item: items.reduce((sum, item) => sum + Number(item.quantity), 0),
      completed_at:
        status === OrderStatus.DELIVERING ? new Date() : undefined,
    } as DeepPartial<orders>);

    const savedOrder = await this.ordersRepository.save(order);

    const orderItemEntities = items.map((item) => {
      const product = productsById.get(item.product_id);
      return this.orderItemsRepository.create({
        order_id: savedOrder.id,
        product_id: item.product_id,
        quantity: String(item.quantity),
        price: Number(product?.price ?? 0),
      });
    });

    await this.orderItemsRepository.save(orderItemEntities);

    return this.ordersRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['provider', 'customer', 'order_items', 'order_items.product'],
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

  // Get orders by customer ID
  async findByCustomer(customerId: number) {
    return this.ordersRepository.find({
      where: { customer_id: customerId },
      relations: ['provider', 'customer', 'order_items', 'order_items.product'],
    });
  }

  // Update order
  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      return { message: 'Order not found.' };
    }

    Object.assign(order, updateOrderDto);
    if (updateOrderDto.status === OrderStatus.DELIVERING && !order.completed_at) {
      order.completed_at = new Date();
    }
    await this.ordersRepository.save(order);

    return {
      message: 'Order updated successfully!',
      data: order,
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

