import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    HttpModule, // ✅ IMPORTANT
  ],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
