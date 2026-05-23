import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ProviderApplication } from './provider-application.entity';
import { ApplicationsController } from './provider-application.controller';
import { ApplicationsService } from './provider-application.service';
import * as fs from 'fs';
import { Provider } from '../providers/providers.entity';
import { users } from '../users/users.entity';

// Ensure upload directory exists at startup
const uploadDir = './uploads/applications';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@Module({
  imports: [
    TypeOrmModule.forFeature([ProviderApplication, users, Provider]),
    MulterModule.register({ dest: uploadDir }),
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ProviderApplicationsModule {}
