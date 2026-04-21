import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderApplication } from './provider-application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderApplication])],
})
export class ApplicationsModule {}
