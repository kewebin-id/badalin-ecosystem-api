import { IPaginationResponse, IUsecaseResponse, globalLogger as Logger } from '@/shared/utils';
import { Pagination, PaginationDto } from '@/shared/utils/rest-api/pagination';
import { Inject, Injectable } from '@nestjs/common';
import { IPilgrimDashboardRepository } from '../ports/dashboard.repository.port';
import { IPilgrimDashboardUseCase, IHistoryResponse } from '../ports/dashboard.usecase.port';

@Injectable()
export class PilgrimDashboardUseCase implements IPilgrimDashboardUseCase {
  constructor(
    @Inject('IPilgrimDashboardRepository')
    private readonly repository: IPilgrimDashboardRepository,
  ) {}

  getHistory = async (
    leaderId: string,
    agencySlug: string,
    paginationDto: PaginationDto,
  ): Promise<IUsecaseResponse<IPaginationResponse<IHistoryResponse>>> => {
    try {
      const pagination = new Pagination(paginationDto.page, paginationDto.limit);
      const { count, rows: submissions } = await this.repository.findHistoryByLeaderAndAgency(
        leaderId,
        agencySlug,
        pagination.offset,
        pagination.limit,
      );

      const mappedRows: IHistoryResponse[] = submissions.map((sub) => {
        const firstFlight = sub.flights?.[0];
        const lastFlight = sub.flights?.[sub.flights.length - 1];
        const firstTransport = sub.transportations?.[0];

        return {
          transactionId: sub.id,
          flightRoute: firstTransport
            ? `${firstTransport.from || ''} - ${firstTransport.to || ''}`
            : firstFlight?.carrier || '-',
          destinationDate: lastFlight?.etd
            ? lastFlight.etd.toISOString()
            : lastFlight?.flightDate.toISOString() || '-',
          totalAmount: Number(sub.totalAmount),
          status: sub.status,
        };
      });

      const paginatedData = pagination.paginate({ count, rows: mappedRows });

      return { data: paginatedData };
    } catch (error) {
      Logger.error('Error in PilgrimDashboardUseCase.getHistory:', error);
      return {
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch history',
          code: 500,
        },
      };
    }
  };
}
