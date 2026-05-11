import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { orders } from './orders.entity';
import { CreateOrderDto, UpdateOrderDto } from './dto/orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(orders)
    private readonly ordersRepository: Repository<orders>,
  ) {}

  // Create a new order
  async create(createOrderDto: CreateOrderDto) {
    try {
      const order = this.ordersRepository.create(createOrderDto);
      await this.ordersRepository.save(order);
      return {
        message: 'Order created successfully!',
        data: order,
      };
    } catch (error) {
      return {
        message: 'Error creating order',
        error: error.message,
      };
    }
  }

  // Get all orders
  async findAll() {
    return this.ordersRepository.find();
  }

  // Get order by ID
  async findOne(id: number) {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      return { message: 'Order not found.' };
    }
    return order;
  }

  // Get orders by provider ID
  async findByProvider(providerId: number) {
    return this.ordersRepository.find({ where: { provider_id: providerId } });
  }

  // Get orders by customer ID
  async findByCustomer(customerId: number) {
    return this.ordersRepository.find({ where: { customer_id: customerId } });
  }

  // Update order
  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      return { message: 'Order not found.' };
    }

    Object.assign(order, updateOrderDto);
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

