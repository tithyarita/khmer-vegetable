import {
  Controller,
  Put,
  Param,
  Body,
  Get,
  Post,
  Delete,
  UploadedFile,
  UseInterceptors,
  Req,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './providers.entity';
import { ProviderBank, BankType } from './provider_bank.entity';
import { ProvidersService } from './provider.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';

interface IncomingBankDto {
  type?: BankType;
  name?: string;
  account?: string;
  holder_name?: string;
  qr?: string;
}

interface UpdateProviderBody {
  banks?: IncomingBankDto[];
  provider_name?: string;
  farm_name?: string;
  location?: string;
  story?: string;
  id_number?: string;
}

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

@Controller('providers')
export class ProvidersController {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,

    @InjectRepository(ProviderBank)
    private readonly bankRepo: Repository<ProviderBank>,

    private readonly providerService: ProvidersService,
  ) {}

  // ========================================
  // GET PROVIDER
  // ========================================
  @Get(':id')
  async getProvider(@Param('id') id: string): Promise<Provider | null> {
    return this.providerRepo.findOne({
      where: { user_id: Number(id) },
      relations: ['user', 'banks', 'reviews'],
    });
  }

  // ========================================
  // UPDATE PROVIDER PROFILE & BANKS
  // ========================================
  @Put(':id')
  async updateProvider(
    @Param('id') id: string,
    @Body() body: UpdateProviderBody,
  ): Promise<Provider | null> {
    const userId = Number(id);
    const { banks, ...profileData } = body;

    if (Object.keys(profileData).length > 0) {
      const { provider_name, farm_name, location, story, id_number } =
        profileData;
      await this.providerRepo.update(
        { user_id: userId },
        { provider_name, farm_name, location, story, id_number },
      );
    }

    if (Array.isArray(banks)) {
      try {
        await this.bankRepo.delete({ provider_id: userId });

        const bankEntities = banks.map((b) => {
          let qrPath = b.qr ?? '';
          if (qrPath.includes('http://localhost:3000')) {
            qrPath = qrPath.replace('http://localhost:3000', '');
          }
          return this.bankRepo.create({
            provider_id: userId,
            type: b.type ?? BankType.ABA,
            name: b.name ?? '',
            account: b.account ?? '',
            holder_name: b.holder_name ?? '',
            qr: qrPath || null,
          });
        });

        await this.bankRepo.save(bankEntities);
      } catch (err) {
        console.error('BANK SAVE ERROR:', err);
        throw err;
      }
    }

    return this.providerRepo.findOne({
      where: { user_id: userId },
      relations: ['user', 'banks', 'reviews'],
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
    @Param('id') id: string,
    @UploadedFile() file: MulterFile | undefined,
  ): Promise<{ avatar: string } | { message: string }> {
    if (!file) return { message: 'No file uploaded' };
    const imagePath = `/images/avatar/${file.filename}`;
    await this.providerRepo.update(
      { user_id: Number(id) },
      { avatar: imagePath },
    );
    return { avatar: `http://localhost:3000${imagePath}` };
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
    @Param('id') id: string,
    @UploadedFile() file: MulterFile | undefined,
  ): Promise<{ farm_image: string } | { message: string }> {
    if (!file) return { message: 'No file uploaded' };
    const imagePath = `/images/farm/${file.filename}`;
    await this.providerRepo.update(
      { user_id: Number(id) },
      { farm_image: imagePath },
    );
    return { farm_image: `http://localhost:3000${imagePath}` };
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
    @Param('id') id: string,
    @UploadedFile() file: MulterFile | undefined,
    @Req() req: Request,
  ): Promise<{ qr: string } | { message: string }> {
    if (!file) return { message: 'No QR uploaded' };

    const imagePath = `/images/qr/${file.filename}`;
    const providerId = Number(id);
    const reqBody = req.body as { bank_index?: string };
    const bankIndex = Number(reqBody.bank_index);

    if (isNaN(bankIndex)) throw new BadRequestException('Invalid bank_index');

    const currentBanks = await this.bankRepo.find({
      where: { provider_id: providerId },
    });

    if (bankIndex >= currentBanks.length) {
      const fallback = this.bankRepo.create({
        provider_id: providerId,
        type: BankType.ABA,
        name: '',
        account: '',
        holder_name: '',
        qr: imagePath,
      });
      await this.bankRepo.save(fallback);
    } else {
      const target = currentBanks[bankIndex];
      await this.bankRepo.update(target.id, { qr: imagePath });
    }

    return { qr: `http://localhost:3000${imagePath}` };
  }

  // ========================================
  // CREATE BANK
  // ========================================
  @Post('banks')
  async createBank(
    @Body()
    body: {
      provider_id: number;
      type?: BankType;
      name: string;
      account: string;
      holder_name: string;
    },
  ): Promise<ProviderBank> {
    const bank = this.bankRepo.create({
      provider_id: body.provider_id,
      type: body.type ?? BankType.ABA,
      name: body.name,
      account: body.account,
      holder_name: body.holder_name,
      qr: null,
    });
    return this.bankRepo.save(bank);
  }

  // ========================================
  // DELETE BANK
  // ========================================
  @Delete('banks/:bankId')
  async deleteBank(
    @Param('bankId') bankId: string,
  ): Promise<{ message: string }> {
    const bank = await this.bankRepo.findOne({ where: { id: Number(bankId) } });
    if (!bank) throw new NotFoundException('Bank not found');
    await this.bankRepo.delete(Number(bankId));
    return { message: 'Bank deleted successfully' };
  }
}
