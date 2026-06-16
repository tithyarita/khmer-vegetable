import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './providers.entity';
import { ProviderBank, BankType } from './provider_bank.entity';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,

    @InjectRepository(ProviderBank)
    private readonly bankRepo: Repository<ProviderBank>,
  ) {}

  // ================= GET PROVIDER =================
  async findByUserId(userId: number): Promise<Provider | null> {
    return this.providerRepo.findOne({
      where: { user_id: userId },
      relations: ['user', 'banks'],
    });
  }

  // ================= CREATE PROVIDER =================
  async createProvider(data: Partial<Provider>): Promise<Provider> {
    const provider = this.providerRepo.create(data);
    return this.providerRepo.save(provider);
  }

  // ================= UPDATE PROVIDER =================
  async updateProvider(userId: number, data: Partial<Provider>) {
    await this.providerRepo.update({ user_id: userId }, data);
    return this.findByUserId(userId);
  }

  // ================= DELETE PROVIDER =================
  async deleteProvider(userId: number): Promise<void> {
    await this.providerRepo.delete({ user_id: userId });
  }

  // ================= CREATE BANK =================
  async createBank(data: {
    provider_id: number;
    type?: BankType;
    name: string;
    account: string;
    holder_name: string;
    qr?: string;
  }): Promise<ProviderBank> {
    if (!data.account) {
      throw new Error('Account is required');
    }

    const bank = this.bankRepo.create({
      provider_id: data.provider_id,
      type: data.type ?? BankType.ABA,
      name: data.name || 'Bank Account',
      account: data.account,
      holder_name: data.holder_name || 'Unknown',
      qr: data.qr ?? null,
    });

    return this.bankRepo.save(bank);
  }

  // ================= DELETE BANK =================
  async deleteBank(bankId: number): Promise<{ message: string }> {
    const bank = await this.bankRepo.findOne({
      where: { id: bankId },
    });

    if (!bank) throw new NotFoundException('Bank not found');

    await this.bankRepo.delete(bankId);

    return { message: 'Bank deleted successfully' };
  }

  // ================= UPDATE AVATAR =================
  async updateAvatar(userId: number, avatar: string) {
    await this.providerRepo.update({ user_id: userId }, { avatar });
    return {
      avatar: `http://localhost:3000${avatar}`,
    };
  }

  // ================= UPDATE FARM IMAGE =================
  async updateFarmImage(userId: number, farm_image: string) {
    await this.providerRepo.update({ user_id: userId }, { farm_image });
    return {
      farm_image: `http://localhost:3000${farm_image}`,
    };
  }

  // ================= UPDATE BANK QR =================
  async updateBankQr(userId: number, bankIndex: number, qr: string) {
    const currentBanks = await this.bankRepo.find({
      where: { provider_id: userId },
    });

    if (bankIndex >= currentBanks.length) {
      const fallback = this.bankRepo.create({
        provider_id: userId,
        type: BankType.ABA,
        name: '',
        account: '',
        holder_name: '',
        qr,
      });
      await this.bankRepo.save(fallback);
    } else {
      const target = currentBanks[bankIndex];
      await this.bankRepo.update(target.id, { qr });
    }

    return {
      qr: `http://localhost:3000${qr}`,
    };
  }
}
