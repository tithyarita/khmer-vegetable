import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { orders } from './orders.entity';
import { orderItems } from './order-items.entity';
import { Product } from '../product/product.entity';
import { Customer } from '../customer/customer.entity';
import { ReportModule } from '../report/report.module'; // <-- import here

@Module({
  imports: [
    TypeOrmModule.forFeature([orders, orderItems, Product, Customer]),
    ReportModule, // <-- makes ReportService available
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
