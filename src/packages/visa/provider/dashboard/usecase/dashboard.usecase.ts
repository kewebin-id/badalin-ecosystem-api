import { IUsecaseResponse } from '@/shared/utils';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { Inject, Injectable } from '@nestjs/common';
import { IProviderDashboardRepository } from '../ports/dashboard.repository.port';
import { IProviderDashboardUseCase, IDashboardSummary } from '../ports/dashboard.usecase.port';

@Injectable()
export class ProviderDashboardUseCase implements IProviderDashboardUseCase {
  constructor(
    @Inject('IProviderDashboardRepository')
    private readonly repository: IProviderDashboardRepository,
  ) {}

  async getSummary(ctx: IUserContext): Promise<IUsecaseResponse<IDashboardSummary>> {
    try {
      const [stats, activities, trends] = await Promise.all([
        this.repository.getStats(ctx.agencySlug!),
        this.repository.getRecentActivities(ctx.agencySlug!, 5),
        this.repository.getVisaTrends(ctx.agencySlug!),
      ]);

      return {
        data: {
          stats,
          activities,
          trends,
        },
      };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch dashboard summary',
          code: 500,
        },
      };
    }
  }
}
