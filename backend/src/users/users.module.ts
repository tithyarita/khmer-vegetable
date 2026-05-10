import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { users } from './users.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { orders } from './orders.entity';
import { products } from './products.entity';
import { orderItems } from './order-items.entity';

@Module({
  imports: [TypeOrmModule.forFeature([users, orders, orderItems, products])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
