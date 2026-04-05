import { VisaSubmission } from '@prisma/client';

export interface IDashboardRepository {
  findHistoryByLeaderAndAgency: (
    leaderId: string,
    agencySlug: string,
    skip?: number,
    take?: number,
  ) => Promise<{ count: number; rows: any[] }>;
}
