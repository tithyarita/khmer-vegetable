import {
  Controller,
  Put,
  Param,
  Body,
  Get,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './providers.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';

@Controller('providers')
export class ProvidersController {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
  ) {}

  // ========================================
  // UPDATE PROVIDER
  // ========================================

  @Put(':id')
  async updateProvider(
    @Param('id') id: number,
    @Body() body: Partial<Provider>,
  ) {
    const userId = Number(id);

    const cleanedBanks = Array.isArray(body.banks)
      ? body.banks.map((b) => ({
          name: b.name || '',
          account: b.account || '',
          qr: b.qr || '',
        }))
      : undefined;

    await this.providerRepo.update(
      { user_id: userId },
      {
        ...body,
        banks: cleanedBanks,
      },
    );

    return this.providerRepo.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
  }

  // ========================================
  // GET PROVIDER
  // ========================================

  @Get(':id')
  async getProvider(@Param('id') id: number) {
    return this.providerRepo.findOne({
      where: { user_id: Number(id) },
      relations: ['user'],
    });
  }

  // ========================================
  // UPLOAD AVATAR
  // ========================================

  @Put(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatar',

        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);

          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  async uploadAvatar(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      return {
        message: 'No file uploaded',
      };
    }

    const imagePath = `/images/avatar/${file.filename}`;

    await this.providerRepo.update(
      { user_id: Number(id) },
      {
        avatar: imagePath,
      },
    );

    return {
      avatar: `http://localhost:3000${imagePath}`,
    };
  }

  // ========================================
  // UPLOAD FARM IMAGE
  // ========================================

  @Put(':id/farm-image')
  @UseInterceptors(
    FileInterceptor('farm', {
      storage: diskStorage({
        destination: './uploads/farm',

        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);

          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  async uploadFarmImage(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      return {
        message: 'No file uploaded',
      };
    }

    const imagePath = `/images/farm/${file.filename}`;

    await this.providerRepo.update(
      { user_id: Number(id) },
      {
        farm_image: imagePath,
      },
    );

    return {
      farm_image: `http://localhost:3000${imagePath}`,
    };
  }

  // ========================================
  // UPLOAD BANK QR
  // ========================================

  @Put(':id/bank-qr')
  @UseInterceptors(
    FileInterceptor('qr', {
      storage: diskStorage({
        destination: './uploads/qr',

        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);

          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  async uploadBankQr(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      return {
        message: 'No QR uploaded',
      };
    }

    const imagePath = `/images/qr/${file.filename}`;

    const provider = await this.providerRepo.findOne({
      where: {
        user_id: Number(id),
      },
    });

    if (!provider) {
      return {
        message: 'Provider not found',
      };
    }

    const banks = Array.isArray(provider.banks) ? provider.banks : [];

    const body = req.body as {
      bank_index: string;
    };

    const bankIndex = Number(body.bank_index);

    if (isNaN(bankIndex)) {
      return {
        message: 'Invalid bank index',
      };
    }

    while (banks.length <= bankIndex) {
      banks.push({
        name: '',
        account: '',
        qr: '',
      });
    }

    banks[bankIndex].qr = `http://localhost:3000${imagePath}`;

    await this.providerRepo.update({ user_id: Number(id) }, { banks });

    return {
      qr: `http://localhost:3000${imagePath}`,
    };
  }
}
