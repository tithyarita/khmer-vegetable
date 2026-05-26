import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { orderItems } from '../users/order-items.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, orderItems]),
    HttpModule, // ✅ IMPORTANT
    AuthModule,
  ],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
