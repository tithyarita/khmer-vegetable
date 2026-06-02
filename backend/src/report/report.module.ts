import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ReportScheduler } from './report.scheduler';

import { Report } from './report.entity';
import { orders } from '../users/orders.entity';
import { Provider } from '../providers/providers.entity';
import { DashboardGateway } from '../realtime/dashboard.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
<<<<<<< HEAD
      Report,
=======
      Report, // ✅ THIS IS REQUIRED (fixes your error)
>>>>>>> 2fb6047838160a94c8fb43b16c0756965e350c44
      orders,
      Provider,
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService, ReportScheduler, DashboardGateway],
  exports: [ReportService],
})
export class ReportModule {}