import { Controller, Put, Param, Body, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './providers.entity';

@Controller('providers')
export class ProvidersController {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
  ) {}

  @Put(':id')
  async updateProvider(@Param('id') id: number, @Body() body: Partial<Provider>) {
    await this.providerRepo.update({ user_id: Number(id) }, body);
    return this.providerRepo.findOne({ where: { user_id: Number(id) } });
  }

  @Get(':id')
  async getProvider(@Param('id') id: number) {
    return this.providerRepo.findOne({ 
      where: { user_id: Number(id) },
      relations: ['user']
    });
  }
}
