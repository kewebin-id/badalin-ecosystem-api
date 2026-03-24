import { Inject, Injectable } from '@nestjs/common';
import { IDashboardUseCase, IHistoryResponse } from '../ports/i.usecase';
import { IDashboardRepository } from '../ports/i.repository';
import { IUsecaseResponse, globalLogger as Logger } from '@/shared/utils';
import { VisaSubmission } from '@prisma/client';

@Injectable()
export class DashboardUseCase implements IDashboardUseCase {
  constructor(
    @Inject('IDashboardRepository')
    private readonly repository: IDashboardRepository,
  ) {}

  getHistory = async (leaderId: string, agencySlug: string): Promise<IUsecaseResponse<IHistoryResponse[]>> => {
    try {
      const submissions: VisaSubmission[] = await this.repository.findHistoryByLeaderAndAgency(leaderId, agencySlug);

      const history: IHistoryResponse[] = submissions.map((sub) => ({
        transaction_id: sub.id,
        flight_route: sub.tripRoute || '-',
        destination_date: sub.flightEtd ? sub.flightEtd.toISOString() : '-',
        total_amount: Number(sub.totalAmount),
        status: sub.status,
      }));

      return { data: history };
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
