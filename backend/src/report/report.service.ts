import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { orders, OrderStatus } from '../users/orders.entity';
import { Provider } from '../providers/providers.entity';
import { Report } from './report.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(orders)
    private readonly ordersRepo: Repository<orders>,

    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,

    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
  ) {}

  // =========================
  // DASHBOARD REPORT (LIVE ANALYTICS)
  // =========================
  async dashboardReport(
    period: string,
    providerId?: number,
    category?: string,
  ) {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    const query = this.ordersRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.provider', 'provider')
      .where('order.status = :status', {
        status: OrderStatus.COMPLETED,
      })
      .andWhere('order.created_at >= :startDate', { startDate });

    if (providerId) {
      query.andWhere('order.provider_id = :providerId', {
        providerId,
      });
    }

    const orders = await query.getMany();

    const totalRevenue = orders.reduce(
      (sum, o) => sum + Number(o.total || 0),
      0,
    );

    const adminProfit = totalRevenue * 0.03;

    const providerMap: Record<string, any> = {};

    for (const order of orders) {
      const name = order.provider?.provider_name || 'Unknown';

      if (!providerMap[name]) {
        providerMap[name] = {
          providerName: name,
          revenue: 0,
          adminProfit: 0,
          totalOrders: 0,
        };
      }

      providerMap[name].revenue += Number(order.total || 0);
      providerMap[name].adminProfit += Number(order.total || 0) * 0.03;
      providerMap[name].totalOrders += 1;
    }

    return {
      summary: {
        totalRevenue,
        adminProfit,
        totalOrders: orders.length,
        totalProviders: await this.providerRepo.count(),
      },
      providerReports: Object.values(providerMap),
      recentOrders: orders.slice(0, 10),
    };
  }

  // =========================
  // SAVE REPORTS TO MYSQL
  // =========================
  async saveReports(body: any) {
    const reports = body?.reports;

    if (!Array.isArray(reports)) {
      return {
        success: false,
        message: 'Invalid reports payload',
      };
    }

    const period = body.period || 'month';
    const periodDate = new Date();

    const toSave = reports.map((r) => ({
      totalRevenue: Number(r.total_revenue || 0),
      adminProfit: Number(r.total_revenue || 0) * 0.03,
      providerUserId: r.provider_id,
      period,
      periodDate,
    }));

    const result = await this.reportRepo.save(toSave);

    return {
      success: true,
      message: 'Reports saved successfully',
      inserted: result.length,
      data: result,
    };
  }

  // =========================
  // SIMPLE TEST ENDPOINT
  // =========================
  generateReport() {
    return {
      success: true,
      message: 'Report system is working',
    };
  }
}