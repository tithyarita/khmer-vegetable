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
import { diskStorage } from 'multer'
import { extname } from 'path'

import { ProductService } from './product.service'
import { ProductDto } from './dto/product.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ================= GET ALL (FIXED) =================
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: any) {
    return this.productService.findAll(
      req.user.id,
      req.user.role,
    )
  }

  // ================= GET ONE =================
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(Number(id))
  }

  // ================= CREATE =================
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const unique =
            Date.now() +
            '-' +
            Math.round(Math.random() * 1e9)

          cb(null, unique + extname(file.originalname))
        },
      }),
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ProductDto,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Image is required')
    }

    return this.productService.create(
      {
        name: body.name,
        price: Number(body.price),
        stock: Number(body.stock),
        category: body.category,
        description: body.description,
        discount: body.discount ?? 0,
        imageUrl: `/images/${file.filename}`,
      },
      req.user.id,
    )
  }

  // ================= UPDATE =================
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const unique =
            Date.now() +
            '-' +
            Math.round(Math.random() * 1e9)

          cb(null, unique + extname(file.originalname))
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ProductDto,
    @Req() req: any,
  ) {
    return this.productService.update(
      Number(id),
      {
        name: body.name,
        price: Number(body.price),
        stock: Number(body.stock),
        category: body.category,
        description: body.description,
        discount: body.discount ?? 0,
        imageUrl: file
          ? `/images/${file.filename}`
          : undefined,
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