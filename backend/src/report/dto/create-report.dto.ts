export class CreateReportDto {
  providerUserId: number | undefined;
  totalRevenue: number | undefined;
  adminProfit: number | undefined;
  period: 'day' | 'week' | 'month' | 'year' | undefined;
  periodDate: string | undefined;
}
