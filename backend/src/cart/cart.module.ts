import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { users } from '../users/users.entity';
import { Product } from '../product/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, users, Product])],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}
