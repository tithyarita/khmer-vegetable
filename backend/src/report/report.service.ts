import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, And } from 'typeorm';
import { Report } from './report.entity';
import { orders as Orders } from '../users/orders.entity';
import { Provider } from '../providers/providers.entity';
import { DashboardGateway } from '../realtime/dashboard.gateway';

@Injectable()
@Injectable()
export class ReportService {
  private logger = new Logger('ReportService');

  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
    @InjectRepository(Orders)
    private readonly orderRepo: Repository<Orders>,
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
    private readonly dashboardGateway: DashboardGateway,
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

      if (!report.provider_name || report.provider_name === 'Unknown') {
        const provider = await this.providerRepo.findOne({
          where: { user_id: order.provider_id },
        });
        if (provider?.provider_name) {
          report.provider_name = provider.provider_name;
        }
      }

      const saved = await this.reportRepo.save(report);

      if (!saved.report_code) {
        saved.report_code = `#REP-${saved.report_id}`;
        await this.reportRepo.save(saved);
      }

      // emit full dashboard update
      try {
        const providerReports = await this.reportRepo.find({ order: { report_id: 'DESC' } });
        const recentOrders = await this.orderRepo.find({ order: { id: 'DESC' }, take: 10 });
        const totalRevenue = providerReports.reduce((s, r) => s + Number(r.total_revenue || 0), 0);
        const totalOrders = providerReports.reduce((s, r) => s + Number(r.total_orders || 0), 0);
        const totalAdmin = providerReports.reduce((s, r) => s + Number(r.admin_profit || 0), 0);

        this.dashboardGateway.emitDashboardUpdate({
          summary: { totalRevenue, adminProfit: totalAdmin, totalOrders, totalProviders: providerReports.length },
          providerReports,
          recentOrders,
        });
      } catch (err) {
        console.error('Dashboard emit failed:', err);
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
  // DECREMENT REPORT ON ORDER DELETE
  // ===============================
  async decrementForOrder(order: Orders) {
    try {
      if (!order?.provider_id) return null;

      const report = await this.reportRepo.findOne({ where: { provider_id: order.provider_id } });
      if (!report) return null;

      report.total_orders = Math.max(0, Number(report.total_orders) - 1);
      report.total_revenue = Number((Number(report.total_revenue || 0) - Number(order.total || 0)).toFixed(2));
      report.admin_profit = this.calculateAdminProfit(Number(report.total_revenue || 0));

      const saved = await this.reportRepo.save(report);

      try {
        const providerReports = await this.reportRepo.find({ order: { report_id: 'DESC' } });
        const recentOrders = await this.orderRepo.find({ order: { id: 'DESC' }, take: 10 });
        const totalRevenue = providerReports.reduce((s, r) => s + Number(r.total_revenue || 0), 0);
        const totalOrders = providerReports.reduce((s, r) => s + Number(r.total_orders || 0), 0);
        const totalAdmin = providerReports.reduce((s, r) => s + Number(r.admin_profit || 0), 0);

        this.dashboardGateway.emitDashboardUpdate({
          summary: { totalRevenue, adminProfit: totalAdmin, totalOrders, totalProviders: providerReports.length },
          providerReports,
          recentOrders,
        });
      } catch (err) {
        console.error('Dashboard emit failed:', err);
      }

      return saved;
    } catch (error) {
      console.error('DECREMENT ORDER REPORT ERROR:', error);
      throw new InternalServerErrorException('Failed to decrement report for order');
    }
  }

  // ===============================
  // ADJUST REPORT ON ORDER UPDATE
  // ===============================
  async adjustForOrderUpdate(oldOrder: Orders, newOrder: Orders) {
    try {
      if (!oldOrder || !newOrder) return null;

      // If provider changed, decrement old and increment new
      if (oldOrder.provider_id !== newOrder.provider_id) {
        await this.decrementForOrder(oldOrder);
        return this.updateForOrder(newOrder);
      }

      // Same provider: adjust revenue difference
      const report = await this.reportRepo.findOne({ where: { provider_id: newOrder.provider_id } });
      if (!report) {
        // create fresh report
        return this.updateForOrder(newOrder);
      }

      const oldTotal = Number(oldOrder.total || 0);
      const newTotal = Number(newOrder.total || 0);
      const diff = Number((newTotal - oldTotal).toFixed(2));

      report.total_revenue = Number((Number(report.total_revenue || 0) + diff).toFixed(2));
      // total_orders unchanged
      report.admin_profit = this.calculateAdminProfit(Number(report.total_revenue || 0));

      const saved = await this.reportRepo.save(report);

      try {
        const providerReports = await this.reportRepo.find({ order: { report_id: 'DESC' } });
        const recentOrders = await this.orderRepo.find({ order: { id: 'DESC' }, take: 10 });
        const totalRevenue = providerReports.reduce((s, r) => s + Number(r.total_revenue || 0), 0);
        const totalOrders = providerReports.reduce((s, r) => s + Number(r.total_orders || 0), 0);
        const totalAdmin = providerReports.reduce((s, r) => s + Number(r.admin_profit || 0), 0);

        this.dashboardGateway.emitDashboardUpdate({
          summary: { totalRevenue, adminProfit: totalAdmin, totalOrders, totalProviders: providerReports.length },
          providerReports,
          recentOrders,
        });
      } catch (err) {
        console.error('Dashboard emit failed:', err);
      }

      return saved;
    } catch (error) {
      console.error('ADJUST ORDER REPORT ERROR:', error);
      throw new InternalServerErrorException('Failed to adjust report for order update');
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

  // Recalculate and persist admin_profit for all stored reports
  async recalculateAdminProfit() {
    try {
      const reports = await this.reportRepo.find();
      const updated: Report[] = [];

      for (const r of reports) {
        const revenue = Number(r.total_revenue || 0);
        const newAdmin = this.calculateAdminProfit(revenue);
        if (Number(r.admin_profit || 0) !== newAdmin) {
          r.admin_profit = newAdmin;
          const saved = await this.reportRepo.save(r);
          updated.push(saved);
        }
      }

      return {
        success: true,
        updated_count: updated.length,
        updated_reports: updated,
      };
    } catch (error) {
      console.error('RECALCULATE ADMIN PROFIT ERROR:', error);
      throw new InternalServerErrorException('Failed to recalculate admin profit');
    }
  }

  // ===============================
  // GET REPORTS BY DATE RANGE (FOR REVENUE TRENDS)
  // ===============================
  async findByDateRange(start: string, end: string) {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);

      // Use TypeORM operators for date range
      const reports = await this.reportRepo.find({
        where: {
          created_at: And(
            MoreThanOrEqual(startDate),
            LessThanOrEqual(endDate)
          ),
        },
        order: { created_at: 'DESC' },
      });

      return reports;
    } catch (error) {
      this.logger.error('Error fetching reports by date range:', error.message);
      return [];
    }
  }

  // ===============================
  // GET ORDERS DISTRIBUTION BY STATUS (FOR ORDER DISTRIBUTION CHART)
  // ===============================
  async getOrdersDistribution(start: string, end: string) {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);

      const orders = await this.orderRepo.find({
        order: { created_at: 'DESC' },
      });

      // Filter by date range in memory
      const filtered = orders.filter(o => {
        if (!o.created_at) return false;
        const d = new Date(o.created_at);
        return d >= startDate && d <= endDate;
      });

      // Count by status
      const statusMap: { [key: string]: number } = {};

      for (const order of filtered) {
        const status = order.status || 'PENDING';
        statusMap[status] = (statusMap[status] || 0) + 1;
      }

      const total = filtered.length;

      // Convert to percentage
      return {
        total,
        statuses: Object.entries(statusMap).map(([status, count]) => ({
          status,
          count,
          percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
        })),
      };
    } catch (error) {
      this.logger.error('Error fetching orders distribution:', error.message);
      return { total: 0, statuses: [] };
    }
  }
}