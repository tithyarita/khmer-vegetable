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
}