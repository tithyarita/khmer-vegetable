import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('dashboard')
  dashboard(
    @Query('period') period = 'month',
    @Query('providerId') providerId?: number,
    @Query('category') category?: string,
  ) {
    return this.reportService.dashboardReport(period, providerId, category);
  }

  @Post('generate')
  async generateReport(@Body() body: any) {
    return this.reportService.saveReports(body);
  }
}