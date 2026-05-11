import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
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
  // GET ORDERS BY PROVIDER ID
  // =========================
  @Get('provider/:providerId')
  async findByProvider(@Param('providerId') providerId: number) {
    return this.ordersService.findByProvider(providerId);
  }

  // =========================
  // GET ORDERS BY CUSTOMER ID
  // =========================
  @Get('customer/:customerId')
  async findByCustomer(@Param('customerId') customerId: number) {
    return this.ordersService.findByCustomer(customerId);
  }

  // =========================
  // GET ORDER BY ID
  // =========================
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.ordersService.findOne(id);
  }

  // =========================
  // UPDATE ORDER
  // =========================
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  // =========================
  // DELETE ORDER
  // =========================
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.ordersService.remove(id);
  }
}
