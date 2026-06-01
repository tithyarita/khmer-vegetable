import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Provider } from './providers.entity';
import { ProvidersController } from './providers.controller';
import { ProviderBank } from './provider_bank.entity';
import { ProvidersService } from './provider.service';

@Module({
  imports: [TypeOrmModule.forFeature([Provider, ProviderBank])],
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService],
})
export class ProvidersModule {}
