import { Inject, Injectable } from '@nestjs/common';
import { IDashboardUseCase, IHistoryResponse } from '../ports/i.usecase';
import { IDashboardRepository } from '../ports/i.repository';
import { IUsecaseResponse, globalLogger as Logger } from '@/shared/utils';

@Injectable()
export class DashboardUseCase implements IDashboardUseCase {
  constructor(
    @Inject('IDashboardRepository')
    private readonly repository: IDashboardRepository,
  ) {}

  getHistory = async (leaderId: string, agencyId: string): Promise<IUsecaseResponse<IHistoryResponse[]>> => {
    try {
      const submissions = await this.repository.findHistoryByLeaderAndAgency(leaderId, agencyId);

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
