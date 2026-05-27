import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportController } from './report.controller';
import { ReportService } from './report.service';

import { Report } from './report.entity';
import { orders } from '../users/orders.entity';
import { Provider } from '../providers/providers.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,   // ✅ THIS IS REQUIRED (fixes your error)
      orders,
      Provider,
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}