import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // (optional manual trigger)
  @Post('generate')
  async generate(@Body() body: any) {
    return { message: 'Use order trigger instead of generate' };
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
}