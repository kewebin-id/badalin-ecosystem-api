import { IPaginationResponse, IUsecaseResponse, globalLogger as Logger } from '@/shared/utils';
import { Pagination, PaginationDto } from '@/shared/utils/rest-api/pagination';
import { Inject, Injectable } from '@nestjs/common';
import { IDashboardRepository } from '../ports/i.repository';
import { IDashboardUseCase, IHistoryResponse } from '../ports/i.usecase';

@Injectable()
export class DashboardUseCase implements IDashboardUseCase {
  constructor(
    @Inject('IDashboardRepository')
    private readonly repository: IDashboardRepository,
  ) {}

  getHistory = async (
    leaderId: string,
    agencySlug: string,
    paginationDto: PaginationDto,
  ): Promise<IUsecaseResponse<IPaginationResponse<IHistoryResponse>>> => {
    try {
      Logger.debug(`Fetching history for leaderId: ${leaderId}, agencySlug: ${agencySlug}`, 'DashboardUseCase');

      const pagination = new Pagination(paginationDto.page, paginationDto.limit);
      const { count, rows: submissions } = await this.repository.findHistoryByLeaderAndAgency(
        leaderId,
        agencySlug,
        pagination.offset,
        pagination.limit,
      );

      Logger.debug(`Found ${submissions.length} submissions out of ${count}`, 'DashboardUseCase');

      const mappedRows: IHistoryResponse[] = submissions.map((sub) => {
        const firstFlight = sub.flights?.[0];
        const lastFlight = sub.flights?.[sub.flights.length - 1];
        const firstTransport = sub.transportations?.[0];

        return {
          transaction_id: sub.id,
          flight_route: firstTransport
            ? `${firstTransport.from || ''} - ${firstTransport.to || ''}`
            : firstFlight?.carrier || '-',
          destination_date: lastFlight?.etd
            ? lastFlight.etd.toISOString()
            : lastFlight?.flightDate.toISOString() || '-',
          total_amount: Number(sub.totalAmount),
          status: sub.status,
        };
      });

      const paginatedData = pagination.paginate({ count, rows: mappedRows });

      return { data: paginatedData };
    } catch (error) {
      Logger.error('Error in DashboardUseCase.getHistory:', error);
      return {
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch history',
          code: 500,
        },
      };
    }
  };
}
