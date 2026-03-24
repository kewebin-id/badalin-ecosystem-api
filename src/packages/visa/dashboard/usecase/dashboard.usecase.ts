import { Inject, Injectable } from '@nestjs/common';
import { IDashboardUseCase, IHistoryResponse } from '../ports/i.usecase';
import { IDashboardRepository } from '../ports/i.repository';
import { IUsecaseResponse, globalLogger as Logger, IPaginationResponse } from '@/shared/utils';
import { VisaSubmission } from '@prisma/client';
import { Pagination, PaginationDto } from '@/shared/utils/rest-api/pagination';

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

      const mappedRows: IHistoryResponse[] = submissions.map((sub) => ({
        transaction_id: sub.id,
        flight_route: sub.tripRoute || '-',
        destination_date: sub.flightEtd ? sub.flightEtd.toISOString() : '-',
        total_amount: Number(sub.totalAmount),
        status: sub.status,
      }));

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
