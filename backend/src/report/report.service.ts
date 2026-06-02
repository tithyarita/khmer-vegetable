import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { orders as Orders } from '../users/orders.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
    @InjectRepository(Orders)
    private readonly orderRepo: Repository<Orders>,
  ) {}

  // ===============================
  // CONFIG
  // ===============================
  private readonly ADMIN_RATE = 0.03;

  private calculateAdminProfit(amount: number): number {
    return Number((amount * this.ADMIN_RATE).toFixed(2));
  }

  // ===============================
  // UTIL: DATE VALIDATION
  // ===============================
  private isValidDate(date: any): boolean {
    const d = new Date(date);
    return !isNaN(d.getTime());
  }

  // ===============================
  // FILTER ORDERS BY PERIOD
  // ===============================
  private filterByPeriod(orders: Orders[], period: string) {
    const now = new Date();

    return orders.filter((o) => {
      if (!o.created_at || !this.isValidDate(o.created_at)) return false;

      const d = new Date(o.created_at);

      switch (period) {
        case 'Daily':
          return d.toDateString() === now.toDateString();

        case 'Weekly': {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          return d >= weekAgo;
        }

        case 'Monthly':
          return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );

        case 'Yearly':
          return d.getFullYear() === now.getFullYear();

        default:
          return true;
      }
    });
  }

  // ===============================
  // BUILD ANALYTICS (LIVE DATA)
  // ===============================
  private async buildAnalytics(period: string) {
    const orders = await this.orderRepo.find({
      relations: ['provider'],
    });

    const filtered = this.filterByPeriod(orders, period);

    const map = new Map<number, any>();

    for (const o of filtered) {
      const providerId = o.provider_id ?? o.provider?.user_id;
      if (!providerId) continue;

      const providerName =
        (o as any)?.provider?.provider_name ||
        (o as any)?.provider?.name ||
        'Unknown';

      if (!map.has(providerId)) {
        map.set(providerId, {
          provider_id: providerId,
          provider_name: providerName,
          total_orders: 0,
          total_revenue: 0,
        });
      }

      const item = map.get(providerId);

      item.total_orders += 1;
      item.total_revenue += Number(o.total || 0);
    }

    return Array.from(map.values()).map((item) => {
      const revenue = Number(item.total_revenue.toFixed(2));

      return {
        provider_id: item.provider_id,
        provider_name: item.provider_name,
        total_orders: item.total_orders,
        total_revenue: revenue,
        admin_profit: this.calculateAdminProfit(revenue),
      };
    });
  }

  // ===============================
  // ⭐ GENERATE REPORTS (SAVES TO MYSQL)
  // ===============================
  async generateReports(period: 'Daily' | 'Weekly' | 'Monthly') {
    try {
      const analytics = await this.buildAnalytics(period);

      for (const item of analytics) {
        let report = await this.reportRepo.findOne({
          where: { provider_id: item.provider_id },
        });

        if (!report) {
          report = this.reportRepo.create({
            provider_id: item.provider_id,
            provider_name: item.provider_name,
            total_orders: 0,
            total_revenue: 0,
            admin_profit: 0,
          });
        }

        report.provider_name = item.provider_name;
        report.total_orders = item.total_orders;
        report.total_revenue = item.total_revenue;
        report.admin_profit = item.admin_profit;

        await this.reportRepo.save(report);
      }

      return {
        success: true,
        period,
        message: `${period} reports generated successfully`,
      };
    } catch (error) {
      console.error('GENERATE REPORT ERROR:', error);
      throw new InternalServerErrorException('Failed to generate reports');
    }
  }

  // ===============================
  // UPDATE REPORT ON ORDER CREATE
  // ===============================
  async updateForOrder(order: Orders) {
    try {
      if (!order?.provider_id) return null;

      let report = await this.reportRepo.findOne({
        where: { provider_id: order.provider_id },
      });

      if (!report) {
        report = this.reportRepo.create({
          provider_id: order.provider_id,
          provider_name: (order as any)?.provider?.provider_name ?? 'Unknown',
          total_orders: 0,
          total_revenue: 0,
          admin_profit: 0,
        });
      }

      report.total_orders += 1;
      report.total_revenue = Number(
        (Number(report.total_revenue) + Number(order.total || 0)).toFixed(2),
      );

      report.admin_profit = this.calculateAdminProfit(report.total_revenue);

      const saved = await this.reportRepo.save(report);

      if (!saved.report_code) {
        saved.report_code = `#REP-${saved.report_id}`;
        await this.reportRepo.save(saved);
      }

      return saved;
    } catch (error) {
      console.error('UPDATE ORDER REPORT ERROR:', error);
      throw new InternalServerErrorException(
        'Failed to update report for order',
      );
    }
  }

  // ===============================
  // GET ALL REPORTS
  // ===============================
  async findAll() {
    try {
      return await this.reportRepo.find({
        order: { report_id: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch reports');
    }
  }

  // ===============================
  // FILTER REPORTS
  // ===============================
  async findByPeriod(period: string) {
    try {
      const allReports = await this.reportRepo.find({
        order: { created_at: 'DESC' },
      });

      if (!period || period === 'All') return allReports;

      const now = new Date();

      return allReports.filter((report) => {
        if (!report.created_at || !this.isValidDate(report.created_at)) {
          return false;
        }

        const d = new Date(report.created_at);

        switch (period) {
          case 'Daily':
            return d.toDateString() === now.toDateString();

          case 'Weekly': {
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            return d >= weekAgo;
          }

          case 'Monthly':
            return (
              d.getMonth() === now.getMonth() &&
              d.getFullYear() === now.getFullYear()
            );

          case 'Yearly':
            return d.getFullYear() === now.getFullYear();

          default:
            return true;
        }
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to filter reports');
    }
  }

  // ===============================
  // ANALYTICS (READ ONLY)
  // ===============================
  async findAnalytics(period: string) {
    try {
      const analytics = await this.buildAnalytics(period);

      return {
        success: true,
        period,
        reports: analytics,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to load analytics');
    }
  }
}