import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // (optional manual trigger)
  @Post('generate')
  async generate(@Body() body: any) {
    const period = (body && body.period) || 'Monthly';
    await this.reportService.generateReports(period);
    return { success: true, period, message: `${period} reports generated` };
  }

  @Get('dashboard')
  async getDashboard(@Query('period') period: string = 'month') {
    // Map query period to service format
    const periodMap: { [key: string]: string } = {
      'day': 'Daily',
      'week': 'Weekly',
      'month': 'Monthly',
      'year': 'Yearly',
    };
    const mappedPeriod = periodMap[period] || 'Monthly';
    return this.reportService.findAnalytics(mappedPeriod);
  }

  @Get()
  async findAll() {
    return this.reportService.findAll();
  }

  @Get('filtered/:period')
  async findByPeriod(@Param('period') period: string) {
    return this.reportService.findByPeriod(period);
  }

  @Get('analytics/:period')
  async getAnalytics(@Param('period') period: string) {
    return this.reportService.findAnalytics(period);
  }

  @Post('recalculate-admin-profit')
  async recalculateAdminProfit() {
    return this.reportService.recalculateAdminProfit();
  }
}