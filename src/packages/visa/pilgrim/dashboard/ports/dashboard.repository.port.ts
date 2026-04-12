import { VisaSubmission, FlightManifest, TransportationManifest } from '@prisma/client';

export type SubmissionHistory = VisaSubmission & {
  flights: FlightManifest[];
  transportations: TransportationManifest[];
};

export interface IPilgrimDashboardRepository {
  findHistoryByLeaderAndAgency: (
    leaderId: string,
    agencySlug: string,
    offset: number,
    limit: number,
  ) => Promise<{ count: number; rows: SubmissionHistory[] }>;
}
