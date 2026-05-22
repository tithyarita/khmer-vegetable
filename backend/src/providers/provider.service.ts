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

  // GET provider by user_id (with user relation)
  async findByUserId(userId: number) {
    return this.providerRepo.findOne({
      where: { user_id: userId },
      relations: ['user'], // important for created_at from users table
    });
  }

  // CREATE provider (used when user registers as provider)
  async createProvider(data: Partial<Provider>) {
    const provider = this.providerRepo.create(data);
    return this.providerRepo.save(provider);
  }

  // UPDATE provider by user_id
  async updateProvider(userId: number, data: Partial<Provider>) {
    await this.providerRepo.update({ user_id: userId }, data);

    return this.findByUserId(userId);
  }

  // DELETE provider
  async deleteProvider(userId: number) {
    return this.providerRepo.delete({ user_id: userId });
  }

  // =============================
  // UPLOAD AVATAR
  // =============================
  async updateAvatar(userId: number, avatar: string) {
    await this.providerRepo.update({ user_id: userId }, { avatar });

    return {
      avatar: `http://localhost:3000${avatar}`,
    };
  }

  // =============================
  // UPLOAD FARM IMAGE
  // =============================
  async updateFarmImage(userId: number, farm_image: string) {
    await this.providerRepo.update({ user_id: userId }, { farm_image });

    return {
      farm_image: `http://localhost:3000${farm_image}`,
    };
  }

  // =============================
  // UPLOAD QR IMAGE
  // =============================
  async updateBankQr(userId: number, qr: string, bankIndex: number) {
    const provider = await this.providerRepo.findOne({
      where: { user_id: userId },
    });

    if (!provider) {
      throw new Error('Provider not found');
    }

    const banks = provider.banks || [];

    // make sure bank exists
    if (!banks[bankIndex]) {
      banks[bankIndex] = {
        name: '',
        account: '',
        qr: '',
      };
    }

    banks[bankIndex].qr = `http://localhost:3000${qr}`;

    await this.providerRepo.update({ user_id: userId }, { banks });

    return {
      qr: `http://localhost:3000${qr}`,
    };
  }
}
