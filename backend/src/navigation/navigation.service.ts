import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PageNavigation } from './navigation.entity';

@Injectable()
export class NavigationService {
  constructor(
    @InjectRepository(PageNavigation)
    private navigationRepository: Repository<PageNavigation>,
  ) {}

  async recordVisit(dto: {
    page_url: string;
    page_name?: string;
    referrer?: string;
    session_id?: string;
    user_id?: number;
    ip_address?: string;
    user_agent?: string;
  }): Promise<PageNavigation> {
    const visit = this.navigationRepository.create({
      page_url: dto.page_url,
      page_name: dto.page_name,
      referrer: dto.referrer,
      session_id: dto.session_id,
      user: dto.user_id ? ({ id: dto.user_id } as any) : undefined,
      ip_address: dto.ip_address,
      user_agent: dto.user_agent,
    });
    return this.navigationRepository.save(visit);
  }

  async getVisits(options: {
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<{ data: PageNavigation[]; total: number }> {
    const { page = 1, limit = 50, startDate, endDate } = options;
    const where: any = {};

    if (startDate && endDate) {
      where.visited_at = Between(startDate, endDate);
    }

    const [data, total] = await this.navigationRepository.findAndCount({
      where,
      order: { visited_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });

    return { data, total };
  }

  async getPopularPages(limit: number = 10): Promise<any[]> {
    return this.navigationRepository
      .createQueryBuilder('nav')
      .select('nav.page_url', 'page_url')
      .addSelect('nav.page_name', 'page_name')
      .addSelect('COUNT(*)', 'visits')
      .groupBy('nav.page_url')
      .addGroupBy('nav.page_name')
      .orderBy('visits', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
