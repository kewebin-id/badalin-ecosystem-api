import { VisaSubmission } from '@prisma/client';

export interface IDashboardRepository {
  findHistoryByLeaderAndAgency: (leaderId: string, agencySlug: string) => Promise<VisaSubmission[]>;
}
