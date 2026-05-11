import { clientDb } from '@/shared/utils/db';
import { IPilgrimDashboardRepository, SubmissionHistory } from '../ports/dashboard.repository.port';

export class PilgrimDashboardRepository implements IPilgrimDashboardRepository {
  private readonly db = clientDb;

  findHistoryByLeaderAndAgency = async (
    leaderId: string,
    agencySlug: string,
    offset: number,
    limit: number,
  ): Promise<{ count: number; rows: SubmissionHistory[] }> => {
    const where: any = {
      leaderId,
    };

    if (agencySlug) {
      where.agencySlug = agencySlug;
    }

    const [count, rows] = await Promise.all([
      this.db.visaSubmission.count({ where }),
      this.db.visaSubmission.findMany({
        where,
        skip: offset,
        take: limit,
        include: {
          flights: true,
          transportations: true,
          hotels: true,
          members: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }) as Promise<SubmissionHistory[]>,
    ]);

    return { count, rows };
  };
}
