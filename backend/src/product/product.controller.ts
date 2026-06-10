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
  Req,
  UseGuards,
} from '@nestjs/common'

import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'

import { ProductService } from './product.service'
import { ProductDto } from './dto/product.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { uploadToCloudinary } from '../cloudinary'

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ================= GET ALL (FIXED) =================
  // Public GET all products
  @Get()
  async findAll() {
    try {
      return await this.productService.findAll();
    } catch (error) {
      console.error('Products fetch error:', error);
      throw error;
    }
  }

  // ================= GET PROVIDER PRODUCTS =================
  @UseGuards(JwtAuthGuard)
  @Get('provider')
  async findProviderProducts(@Req() req: any) {
    try {
      return await this.productService.findByProvider(req.user.id);
    } catch (error) {
      console.error('Provider products fetch error:', error);
      throw error;
    }
  }

  // ================= GET ONE =================
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.productService.findOne(Number(id));
    } catch (error) {
      console.error('Product fetch error:', error);
      throw error;
    }
  }

  // ================= CREATE =================
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', { storage: memoryStorage() }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ProductDto,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Image is required')
    }

    const imageUrl = await uploadToCloudinary(file.buffer, 'products')

    return this.productService.create(
      {
        name: body.name,
        price: Number(body.price),
        stock: Number(body.stock),
        category: body.category,
        description: body.description,
        discount: body.discount ?? 0,
        weight: body.weight,
        imageUrl,
      },
      req.user.id,
    )
  }

  // ================= UPDATE =================
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', { storage: memoryStorage() }),
  )
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ProductDto,
    @Req() req: any,
  ) {
    const imageUrl = file
      ? await uploadToCloudinary(file.buffer, 'products')
      : undefined

    return this.productService.update(
      Number(id),
      {
        name: body.name,
        price: Number(body.price),
        stock: Number(body.stock),
        category: body.category,
        description: body.description,
        discount: body.discount ?? 0,
        weight: body.weight,
        imageUrl,
      },
      req.user.id,
      req.user.role,
    )
  }

  // ================= DELETE =================
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.productService.remove(
      Number(id),
      req.user.id,
      req.user.role,
    )
  }
}