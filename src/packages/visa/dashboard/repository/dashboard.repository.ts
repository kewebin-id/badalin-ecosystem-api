import { Injectable } from '@nestjs/common';
import { VisaSubmission } from '@prisma/client';
import { IDashboardRepository } from '../ports/i.repository';
import { clientDb } from '@/shared/utils';
import { globalLogger as Logger } from '@/shared/utils';

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  private readonly db = clientDb;

  findHistoryByLeaderAndAgency = async (leaderId: string, agencySlug: string): Promise<VisaSubmission[]> => {
    try {
      const result = await this.db.visaSubmission.findMany({
        where: {
          leaderId: leaderId,
          agencySlug: agencySlug,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return result;
    } catch (error) {
      Logger.error(`Error in findHistoryByLeaderAndAgency: leaderId=${leaderId}, agencySlug=${agencySlug}`, error, 'DashboardRepository');
      throw error;
    }
  };
}
