import { IUsecaseResponse, IPaginationResponse } from '@/shared/utils/rest-api/types';
import { PaginationDto } from '@/shared/utils/rest-api/pagination';

export interface IHistoryResponse {
  transaction_id: string;
  flight_route: string;
  destination_date: string;
  total_amount: number;
  status: string;
}

export interface IPilgrimDashboardUseCase {
  getHistory: (
    leaderId: string,
    agencySlug: string,
    paginationDto: PaginationDto,
  ) => Promise<IUsecaseResponse<IPaginationResponse<IHistoryResponse>>>;
}
