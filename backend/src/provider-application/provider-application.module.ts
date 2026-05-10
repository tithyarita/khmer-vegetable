import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ProviderApplication } from './provider-application.entity';
import { ApplicationsController } from './provider-application.controller';
import { ApplicationsService } from './provider-application.service';
import * as fs from 'fs';

// Ensure upload directory exists at startup
const uploadDir = './uploads/applications';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@Module({
  imports: [
    TypeOrmModule.forFeature([ProviderApplication]),
    MulterModule.register({ dest: uploadDir }),
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ProviderApplicationsModule {}
