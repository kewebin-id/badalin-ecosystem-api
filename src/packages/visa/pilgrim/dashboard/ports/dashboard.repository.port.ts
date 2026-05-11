import { VisaSubmission, FlightManifest, TransportationManifest, HotelManifest, Pilgrim } from '@prisma/client';

export type SubmissionHistory = VisaSubmission & {
  flights: FlightManifest[];
  transportations: TransportationManifest[];
  hotels: HotelManifest[];
  members: Pilgrim[];
};

export interface IPilgrimDashboardRepository {
  findHistoryByLeaderAndAgency: (
    leaderId: string,
    agencySlug: string,
    offset: number,
    limit: number,
  ) => Promise<{ count: number; rows: SubmissionHistory[] }>;
}
