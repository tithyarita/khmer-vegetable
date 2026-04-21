import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from './providers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Provider])],
})
export class ProvidersModule {}
