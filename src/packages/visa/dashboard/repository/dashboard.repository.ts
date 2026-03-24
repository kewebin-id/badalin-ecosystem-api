import { Injectable } from '@nestjs/common';
import { VisaSubmission } from '@prisma/client';
import { IDashboardRepository } from '../ports/i.repository';
import { clientDb } from '@/shared/utils';
import { globalLogger as Logger } from '@/shared/utils';

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  private readonly db = clientDb;

  findHistoryByLeaderAndAgency = async (
    leaderId: string,
    agencySlug: string,
    skip: number = 0,
    take: number = 10,
  ): Promise<{ count: number; rows: VisaSubmission[] }> => {
    const where = {
      leaderId: leaderId,
      agencySlug: agencySlug,
      deletedAt: null,
    };

    const [count, rows] = await this.db.$transaction([
      this.db.visaSubmission.count({ where }),
      this.db.visaSubmission.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return { count, rows };
  };
}
