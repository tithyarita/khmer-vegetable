import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './providers.entity';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
  ) {}

  // =========================
  // GET PROVIDER
  // =========================
  findByUserId(userId: number) {
    return this.providerRepo.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
  }

  // =========================
  // UPDATE GENERAL PROVIDER
  // =========================
  async updateProvider(userId: number, data: any) {
    const { banks, user_id, user, ...rest } = data || {};

    const cleanBanks = Array.isArray(banks)
      ? banks.map((b: any) => ({
          name: b?.name ?? '',
          account: b?.account ?? '',
          qr: b?.qr ?? '',
        }))
      : undefined;

    await this.providerRepo.update(
      { user_id: userId },
      cleanBanks ? { ...rest, banks: cleanBanks } : rest,
    );

    return this.findByUserId(userId);
  }

  // =========================
  // UPDATE AVATAR
  // =========================
  async updateAvatar(userId: number, avatar: string) {
    await this.providerRepo.update(
      { user_id: userId },
      { avatar: avatar as any },
    );

    return {
      avatar: `http://localhost:3000${avatar}`,
    };
  }

  // =========================
  // UPDATE FARM IMAGE
  // =========================
  async updateFarmImage(userId: number, farm_image: string) {
    await this.providerRepo.update(
      { user_id: userId },
      { farm_image: farm_image as any },
    );

    return {
      farm_image: `http://localhost:3000${farm_image}`,
    };
  }

  // =========================
  // UPDATE BANK QR
  // =========================
  async updateBankQr(userId: number, bankIndex: number, qr: string) {
    const provider = await this.findByUserId(userId);

    if (!provider) {
      throw new Error('Provider not found');
    }

    const banks = Array.isArray(provider.banks)
      ? [...provider.banks]
      : [];

    while (banks.length <= bankIndex) {
      banks.push({
        name: '',
        account: '',
        qr: '',
      });
    }

    banks[bankIndex].qr = `http://localhost:3000${qr}`;

    await this.providerRepo.update(
      { user_id: userId },
      { banks },
    );

    return {
      qr: `http://localhost:3000${qr}`,
    };
  }
}