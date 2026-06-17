import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { orderItems } from '../users/order-items.entity';
import { Cart } from '../cart/cart.entity';
import { Favorite } from '../favorite/favorite.entity';
import { Review } from '../review/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, orderItems, Cart, Favorite, Review]),
    HttpModule,
    AuthModule,
  ],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
