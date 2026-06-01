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
  InternalServerErrorException,
  HttpException,
  BadRequestException,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { OrderStatus, PaymentStatus } from './orders.entity';
import { CreateOrderDto, UpdateOrderDto } from './dto/orders.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

interface ProviderOrderItem {
  id: number;
  quantity: number;
}

interface ProviderGroup {
  providerId: number;
  items: ProviderOrderItem[];
}

interface CreateOrderBody {
  providerOrders: string;
  customer_id: string;
  paymentMethod: string;
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // =========================
  // CREATE ORDER
  // =========================
  // ✅ fix - handle FormData with file upload
  @Post()
  @UseInterceptors(
    FileInterceptor('receipt', {
      storage: diskStorage({
        destination: './uploads/payment-proofs',
        filename: (_, file, cb) => {
          const filename =
            Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
          cb(null, filename);
        },
      }),
    }),
  )
  async create(
    @Body() body: CreateOrderBody,
    @UploadedFile() file: MulterFile | undefined,
  ) {
    try {
      const providerOrders = JSON.parse(
        body.providerOrders || '[]',
      ) as ProviderGroup[];
      const customerId = Number(body.customer_id);
      const paymentMethod = body.paymentMethod || 'cash';
      const proofPath = file
        ? `/images/payment-proofs/${file.filename}`
        : undefined;

      if (!customerId) {
        throw new BadRequestException('customer_id is required');
      }

      if (!providerOrders.length) {
        throw new BadRequestException('No provider orders found');
      }

      const results: object[] = [];

      for (const providerGroup of providerOrders) {
        const providerItems = providerGroup.items.map(
          (i: ProviderOrderItem) => ({
            product_id: Number(i.id),
            quantity: Number(i.quantity),
          }),
        );

        const dto: CreateOrderDto = {
          customer_id: customerId,
          provider_id: Number(providerGroup.providerId),
          items: providerItems,
          payment_method: paymentMethod,
          payment_status: PaymentStatus.PENDING,
          payment_proof: proofPath,
        };

        const result = await this.ordersService.create(dto, proofPath);
        results.push(result);
      }

      return { message: 'Orders created successfully!', data: results };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Order creation failed',
      );
    }
  }

  // =========================
  // UPLOAD PAYMENT PROOF
  // =========================
  @Post(':id/payment-proof')
  @UseInterceptors(
    FileInterceptor('proof', {
      storage: diskStorage({
        destination: './uploads/payment-proofs',
        filename: (_, file, cb) => {
          const filename =
            Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
          cb(null, filename);
        },
      }),
    }),
  )
  async uploadPaymentProof(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: MulterFile | undefined,
  ) {
    if (!file) return { message: 'No file uploaded' };
    return this.ordersService.uploadPaymentProof(id, file.filename);
  }

  // =========================
  // GET ALL ORDERS
  // =========================
  @Get()
  async findAll() {
    return this.ordersService.findAll();
  }

  // =========================
  // GET ORDERS BY PROVIDER
  // =========================
  @Get('provider/:providerId')
  async findByProvider(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.ordersService.findByProvider(providerId);
  }

  // =========================
  // GET PROVIDER REVENUE SUMMARY
  // =========================
  @Get('provider/:providerId/revenue')
  async getProviderRevenue(
    @Param('providerId', ParseIntPipe) providerId: number,
  ) {
    return this.ordersService.getProviderRevenue(providerId);
  }

  // =========================
  // GET ORDERS BY CUSTOMER ID
  // =========================
  @Get('customer/:customerId')
  async findByCustomer(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.ordersService.findByCustomer(customerId);
  }

  // =========================
  // GET ORDER BY ID
  // =========================
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  // =========================
  // UPDATE STATUS ONLY
  // =========================
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: OrderStatus },
  ) {
    const partialUpdate: UpdateOrderDto = { status: body.status };
    return this.ordersService.update(id, partialUpdate);
  }

  // =========================
  // UPDATE ORDER
  // =========================
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  // =========================
  // DELETE ORDER
  // =========================
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}
