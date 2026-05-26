import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { OrderStatus } from './orders.entity';
import { CreateOrderDto, UpdateOrderDto } from './dto/orders.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // =========================
  // CREATE ORDER
  // =========================
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.ordersService.create(createOrderDto);
  }

  // =========================
  // GET ALL ORDERS
  // =========================
  @Get()
  async findAll() {
    return await this.ordersService.findAll();
  }

  // =========================
  // GET ORDERS BY PROVIDER
  // =========================
  @Get('provider/:providerId')
  async findByProvider(
    @Param('providerId', ParseIntPipe)
    providerId: number,
  ) {
    return await this.ordersService.findByProvider(providerId);
  }

  // =========================

  // GET ORDERS BY CUSTOMER
  // GET PROVIDER REVENUE SUMMARY
  // =========================
  @Get('provider/:providerId/revenue')
  getProviderRevenue(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.ordersService.getProviderRevenue(providerId);
  }

  // =========================
  // GET ORDERS BY CUSTOMER ID
  // =========================
  @Get('customer/:customerId')
  async findByCustomer(
    @Param('customerId', ParseIntPipe)
    customerId: number,
  ) {
    return await this.ordersService.findByCustomer(customerId);
  }

  // =========================
  // GET ORDER BY ID
  // =========================
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return await this.ordersService.findOne(id);
  }

  // =========================
  // UPDATE STATUS ONLY
  // =========================
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    body: { status: OrderStatus },
  ) {
    return await this.ordersService.updateStatus(id, body.status);
  }

  // =========================
  // UPDATE ORDER
  // =========================
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateOrderDto: UpdateOrderDto,
  ) {
    return await this.ordersService.update(id, updateOrderDto);
  }

  // =========================
  // DELETE ORDER
  // =========================
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return await this.ordersService.remove(id);
  }
}
