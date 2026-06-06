import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Request,
  HttpException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { OrdersService } from './orders.service';
import { OrderStatus, PaymentStatus } from './orders.entity';
import { CreateOrderDto, UpdateOrderDto } from './dto/orders.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface MulterFile {
  filename: string;
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // =========================
  // CREATE ORDER
  // =========================
  @UseGuards(JwtAuthGuard)
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
  async create(
    @Request() req: any,
    @Body() body: any,
    @UploadedFile() file?: MulterFile,
  ) {
    try {
      const customerId = Number(req.user?.id ?? req.user?.sub ?? 0);
      if (!customerId) {
        throw new BadRequestException('Authenticated customer is required to place an order.');
      }

      const providerOrders = body.providerOrders
        ? JSON.parse(body.providerOrders)
        : [];

      if (Array.isArray(providerOrders) && providerOrders.length > 0) {
        const dtos: CreateOrderDto[] = providerOrders.map((group: any) => {
          const providerId = Number(group.providerId || group.provider_id || 0);
          if (!providerId) {
            throw new BadRequestException('Each provider order group must include a valid provider_id.');
          }

          return {
            customer_id: customerId,
            provider_id: providerId,
            items: Array.isArray(group.items)
              ? group.items.map((item: any) => ({
                  product_id: Number(item.product_id || item.id),
                  quantity: Number(item.quantity || 0),
                }))
              : [],
            payment_method: body.payment_method,
            payment_status: PaymentStatus.PENDING,
          };
        });

        return await this.ordersService.createMany(dtos, file?.filename);
      }

      const dto: CreateOrderDto = {
        customer_id: customerId,
        provider_id: Number(body.provider_id),
        items: JSON.parse(body.items || '[]'),
        payment_method: body.payment_method,
        payment_status: PaymentStatus.PENDING,
      };

      return await this.ordersService.create(dto, file?.filename);
    } catch (error) {
      console.error('Order creation error:', error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error?.message || 'Order creation failed');
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
