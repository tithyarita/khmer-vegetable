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

import { ProvidersService } from './provider.service';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providerService: ProvidersService) {}

  // GET
  @Get(':id')
  getProvider(@Param('id') id: number) {
    return this.providerService.findByUserId(Number(id));
  }

  // UPDATE
  @Put(':id')
  updateProvider(@Param('id') id: number, @Body() body: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.providerService.updateProvider(Number(id), body);
  }

  // AVATAR
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
  uploadAvatar(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) return { message: 'No file uploaded' };

    const path = `/images/avatar/${file.filename}`;

    return this.providerService.updateAvatar(Number(id), path);
  }

  // FARM IMAGE
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
  uploadFarmImage(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) return { message: 'No file uploaded' };

    const path = `/images/farm/${file.filename}`;

    return this.providerService.updateFarmImage(Number(id), path);
  }

  // BANK QR
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
  uploadBankQr(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) return { message: 'No QR uploaded' };

    const bankIndex =
      typeof req.body === 'object' && req.body !== null
        ? Number((req.body as Record<string, any>).bank_index)
        : NaN;
    const path = `/images/qr/${file.filename}`;
    return this.providerService.updateBankQr(Number(id), bankIndex, path);
  }
}
