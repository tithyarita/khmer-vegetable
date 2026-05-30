import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Provider } from './providers.entity';
import { ProvidersController } from './providers.controller';
<<<<<<< HEAD
import { ProviderBank } from './provider_bank.entity';
=======
>>>>>>> f17bc122b0513db18c3dfe6f40d3e0f7955e389c
import { ProvidersService } from './provider.service';

@Module({
  imports: [TypeOrmModule.forFeature([Provider, ProviderBank])],
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService],
})
export class ProvidersModule {}