import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportService } from './report.service';

@Injectable()
export class ReportScheduler {
  private readonly logger = new Logger(ReportScheduler.name);
  constructor(private readonly reportService: ReportService) {}

  // Run daily at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDaily() {
    this.logger.log('Running daily report generation');
    try {
      await this.reportService.generateReports('Daily');
    } catch (err) {
      this.logger.error('Daily report generation failed', err as any);
    }
  }

  // Run weekly on Sunday at 01:00
  @Cron('0 1 * * 0')
  async handleWeekly() {
    this.logger.log('Running weekly report generation');
    try {
      await this.reportService.generateReports('Weekly');
    } catch (err) {
      this.logger.error('Weekly report generation failed', err as any);
    }
  }

  // Run monthly on first day at 02:00
  @Cron('0 2 1 * *')
  async handleMonthly() {
    this.logger.log('Running monthly report generation');
    try {
      await this.reportService.generateReports('Monthly');
    } catch (err) {
      this.logger.error('Monthly report generation failed', err as any);
    }
  }
}
