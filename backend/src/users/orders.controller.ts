import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/orders.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // =========================
  // CREATE ORDER
  // =========================
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  // =========================
  // GET ALL ORDERS
  // =========================
  @Get()
  async findAll() {
    return this.ordersService.findAll();
  }

  // =========================
  // TOP SELLING PRODUCTS
  // =========================
  @Get('top-products')
  async getTopSellingProducts(
    @Query('period') period?: 'week' | 'month',
    @Query('customerId') customerId?: string,
  ) {
    return this.ordersService.getTopSellingProducts(
      period === 'month' ? 'month' : 'week',
      customerId ? Number(customerId) : undefined,
    );
  }

  // =========================
  // GET ORDERS BY PROVIDER ID
  // =========================
  @Get('provider/:providerId')
  async findByProvider(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.ordersService.findByProvider(providerId);
  }

  // =========================
  // GET PROVIDER REVENUE SUMMARY
  // =========================
  @Get('provider/:providerId/revenue')
  async getProviderRevenue(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.ordersService.getProviderRevenue(providerId);
  }

  // =========================
  // GET ORDERS BY CUSTOMER ID
  // =========================
  @Get('customer/:customerId')
  async findByCustomer(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.ordersService.findByCustomer(customerId);
  }

  // =========================
  // GET ORDER BY ID
  // =========================
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  // =========================
  // UPDATE ORDER
  // =========================
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  // =========================
  // DELETE ORDER
  // =========================
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}
