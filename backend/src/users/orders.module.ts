import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { orders } from './orders.entity';
import { orderItems } from './order-items.entity';
import { Product } from '../product/product.entity';
import { Customer } from '../customer/customer.entity';
import { users } from './users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([orders, orderItems, Product, Customer, users]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
