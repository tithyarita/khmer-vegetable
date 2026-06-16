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
  Query,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { uploadToCloudinary } from '../cloudinary';

import { OrdersService } from './orders.service';
import { OrderStatus, PaymentStatus } from './orders.entity';
import { CreateOrderDto, UpdateOrderDto } from './dto/orders.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async create(
    @Request() req: any,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const customerId = Number(req.user?.id ?? req.user?.sub ?? 0);
      if (!customerId) {
        throw new BadRequestException('Authenticated customer is required to place an order.');
      }

      let receiptUrl: string | undefined;
      if (file) {
        receiptUrl = await uploadToCloudinary(
          file.buffer,
          'orders/receipts',
          file.originalname,
        );
      }

      const providerOrders = body.providerOrders
        ? JSON.parse(body.providerOrders)
        : [];

      const checkoutFees = {
        shippingFee: Number(body.shippingFee || 0),
        serviceFee: Number(body.serviceFee || 0),
        grandTotal: Number(body.total || 0),
      };

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
                  unit_price: Number(item.unit_price || item.unitPrice || 0) || undefined,
                }))
              : [],
            payment_method: body.payment_method,
            payment_status: PaymentStatus.PENDING,
          };
        });

        return await this.ordersService.createMany(dtos, receiptUrl, checkoutFees);
      }

      const parsedItems = JSON.parse(body.items || '[]');
      const dto: CreateOrderDto = {
        customer_id: customerId,
        provider_id: Number(body.provider_id),
        items: Array.isArray(parsedItems)
          ? parsedItems.map((item: any) => ({
              product_id: Number(item.product_id || item.id || item.productId),
              quantity: Number(item.quantity || 0),
              unit_price: Number(item.unit_price || item.unitPrice || item.price || 0) || undefined,
            }))
          : [],
        payment_method: body.payment_method,
        payment_status: PaymentStatus.PENDING,
      };

      return await this.ordersService.create(dto, receiptUrl, checkoutFees);
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
  async getProviderRevenue(
    @Param('id', ParseIntPipe) id: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.ordersService.getProviderRevenue(id, startDate, endDate);
  }

  @Get('provider/:id')
  async findByProvider(@Param('id', ParseIntPipe) id: number) {
    return await this.ordersService.findByProvider(id);
  }

  // =========================
  // GET BY CUSTOMER
  // =========================
  @Get('customer/:id')
  async findByCustomer(@Param('id', ParseIntPipe) id: number) {
    return await this.ordersService.findByCustomer(id);
  }

  // =========================
  // GET TOP PRODUCTS
  // =========================
  @Get('top-products')
  async getTopProducts(
    @Query('period') period?: string,
    @Query('providerId') providerId?: string,
  ) {
    const parsedProviderId = providerId && !isNaN(Number(providerId)) ? Number(providerId) : undefined;
    return await this.ordersService.getTopProducts(period, parsedProviderId);
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
