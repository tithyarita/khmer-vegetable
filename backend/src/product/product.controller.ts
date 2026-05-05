import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { ProductService } from './product.service';
import { ProductDto } from './dto/product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // 📦 GET ALL
  @Get()
  findAll() {
    return this.productService.findAll();
  }

  // 🔍 GET ONE
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(Number(id));
  }

  // ➕ CREATE
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  create(@UploadedFile() file: Express.Multer.File, @Body() body: ProductDto) {
    if (!file) {
      throw new BadRequestException('Image is required');
    }

    return this.productService.create({
      name: body.name,
      price: Number(body.price),
      stock: Number(body.stock),
      category: body.category,
      description: body.description,
      discount: body.discount ?? 0,
      imageUrl: `/images/${file.filename}`,
    });
  }

  // ✏️ UPDATE (THIS FIXES YOUR 404 ISSUE)
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ProductDto,
  ) {
    return this.productService.update(Number(id), {
      name: body.name,
      price: Number(body.price),
      stock: Number(body.stock),
      category: body.category,
      description: body.description,
      discount: body.discount ?? 0,
      imageUrl: file ? `/images/${file.filename}` : undefined,
    });
  }

  // ❌ DELETE
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(Number(id));
  }
}
