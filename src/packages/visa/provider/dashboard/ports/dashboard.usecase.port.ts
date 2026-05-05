import { IUsecaseResponse } from '@/shared/utils';
import { IUserContext } from '@/shared/utils/rest-api/types';

export interface IDashboardStats {
  totalSubmissions: number;
  pendingPayments: number;
  documentsInReview: number;
  issuedVisas: number;
}

export interface IDashboardActivity {
  id: string;
  description: string;
  status: string;
  timestamp: Date;
  type: 'payment' | 'visa' | 'manifest';
}

export interface IVisaTrend {
  month: string;
  visas: number;
}

export interface IDashboardSummary {
  stats: IDashboardStats;
  activities: IDashboardActivity[];
  trends: IVisaTrend[];
}

export interface IProviderDashboardUseCase {
  getSummary(ctx: IUserContext): Promise<IUsecaseResponse<IDashboardSummary>>;
}
