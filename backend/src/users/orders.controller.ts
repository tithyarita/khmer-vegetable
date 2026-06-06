import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Query,
  UploadedFile,
  UseInterceptors,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { OrdersService } from './orders.service';
import { OrderStatus, PaymentStatus } from './orders.entity';
import { CreateOrderDto, UpdateOrderDto } from './dto/orders.dto';

interface MulterFile {
  filename: string;
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // =========================
  // CREATE ORDER
  // =========================
  @Post()
  @UseInterceptors(
    FileInterceptor('receipt', {
      storage: diskStorage({
        destination: './uploads/payment-proofs',
        filename: (_, file, cb) => {
          cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
        },
      }),
    }),
  )
  async create(@Body() body: any, @UploadedFile() file?: MulterFile) {
    try {
      const dto: CreateOrderDto = {
        customer_id: Number(body.customer_id),
        provider_id: Number(body.provider_id),
        items: JSON.parse(body.items || '[]'),
        payment_method: body.payment_method,
        payment_status: PaymentStatus.PENDING,
      };

      return await this.ordersService.create(dto, file?.filename);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Order creation failed');
    }
  }

  // =========================
  // GET ALL
  // =========================
  @Get()
  async findAll() {
    return await this.ordersService.findAll();
  }

  // =========================
  // GET BY PROVIDER
  // =========================
  @Get('provider/:id/revenue')
  async getProviderRevenue(@Param('id', ParseIntPipe) id: number) {
    return await this.ordersService.getProviderRevenue(id);
  }

  @Get('provider/:id')
  async findByProvider(@Param('id', ParseIntPipe) id: number) {
    return await this.ordersService.findByProvider(id);
  }

  // =========================
  // GET ONE
  // =========================
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.ordersService.findOne(id);
  }

  // =========================
  // UPDATE STATUS (IMPORTANT FOR FRONTEND)
  // =========================
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: OrderStatus },
  ) {
    return this.ordersService.updateStatus(id, body.status);
  }

  // =========================
  // UPDATE ORDER
  // =========================
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  // =========================
  // DELETE ORDER
  // =========================
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}
