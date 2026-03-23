import { IUsecaseResponse } from '@/shared/utils/rest-api/types';

export interface IHistoryResponse {
  transaction_id: string;
  flight_route: string;
  destination_date: string;
  total_amount: number;
  status: string;
}

export interface IDashboardUseCase {
  getHistory: (leaderId: string, agencyId: string) => Promise<IUsecaseResponse<IHistoryResponse[]>>;
}
