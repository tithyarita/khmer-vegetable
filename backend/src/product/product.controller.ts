import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
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

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(Number(id));
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  create(@UploadedFile() file: Express.Multer.File, @Body() body: ProductDto) {
    console.log('BODY:', body);
    console.log('FILE:', file); // 👈 DEBUG

    if (!file) {
      throw new BadRequestException(
        'Image not received → check form-data (image must be FILE)',
      );
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(Number(id));
  }
}
