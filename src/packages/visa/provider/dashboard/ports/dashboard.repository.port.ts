import { IDashboardStats, IDashboardActivity, IVisaTrend } from './dashboard.usecase.port';

export interface IProviderDashboardRepository {
  getStats(agencySlug: string): Promise<IDashboardStats>;
  getRecentActivities(agencySlug: string, limit: number): Promise<IDashboardActivity[]>;
  getVisaTrends(agencySlug: string): Promise<IVisaTrend[]>;
}
