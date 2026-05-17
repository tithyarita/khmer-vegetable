import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { users } from './users.entity';
import { Customer } from '../customer/customer.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { orders } from './orders.entity';
import { products } from './products.entity';
import { orderItems } from './order-items.entity';
import { orderHistory } from './order-histories.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      users,
      orders,
      orderItems,
      products,
      orderHistory,
      Customer,
    ]),
  ],
  controllers: [UsersController, OrdersController],
  providers: [UsersService, OrdersService],
  exports: [UsersService, OrdersService],
})
export class UsersModule {}
