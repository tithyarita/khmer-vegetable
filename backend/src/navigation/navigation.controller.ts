import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { NavigationService } from './navigation.service';

@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Post('visit')
  async recordVisit(
    @Body() dto: {
      page_url: string;
      page_name?: string;
      referrer?: string;
      session_id?: string;
      user_id?: number;
      ip_address?: string;
      user_agent?: string;
    },
  ) {
    return this.navigationService.recordVisit(dto);
  }

  @Get('visits')
  async getVisits(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.navigationService.getVisits({
      page,
      limit,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('popular')
  async getPopularPages(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.navigationService.getPopularPages(limit);
  }
}
