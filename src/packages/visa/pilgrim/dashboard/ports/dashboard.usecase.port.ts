import { IUsecaseResponse, IPaginationResponse } from '@/shared/utils/rest-api/types';
import { PaginationDto } from '@/shared/utils/rest-api/pagination';

export interface IHistoryResponse {
  transactionId: string;
  flightRoute: string;
  destinationDate: string;
  totalAmount: number;
  status: string;
}

export interface IPilgrimDashboardUseCase {
  getHistory: (
    leaderId: string,
    agencySlug: string,
    paginationDto: PaginationDto,
  ) => Promise<IUsecaseResponse<IPaginationResponse<IHistoryResponse>>>;
}
