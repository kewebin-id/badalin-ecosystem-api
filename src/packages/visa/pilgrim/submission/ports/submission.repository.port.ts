import { IUserContext } from '@/shared/utils/rest-api/types';
import { VerifyStatus } from '@prisma/client';
import {
  FlightManifestEntity,
  HotelManifestEntity,
  TransportationManifestEntity,
  VisaSubmissionEntity,
} from '../domain/submission.entity';

export interface IVisaSubmissionCreateInput {
  agencySlug: string;
  pilgrimIds: string[];
  rawdahMenTime?: string;
  rawdahWomenTime?: string;
  notes?: string;
  totalAmount: number;
  flights?: FlightManifestEntity[];
  hotels?: HotelManifestEntity[];
  transportations?: TransportationManifestEntity[];
}

export interface IManifestsInput {
  flights?: FlightManifestEntity[];
  hotels?: HotelManifestEntity[];
  transportations?: TransportationManifestEntity[];
}

export interface IVisaSubmissionRepository {
  findById(id: string, ctx?: IUserContext): Promise<VisaSubmissionEntity | null>;
  findAll(
    params: { page?: number; limit?: number; search?: string },
    ctx: IUserContext,
  ): Promise<{ data: VisaSubmissionEntity[]; total: number }>;

  create(data: IVisaSubmissionCreateInput, ctx: IUserContext): Promise<VisaSubmissionEntity>;

  update(
    id: string,
    data: Partial<VisaSubmissionEntity>,
    pilgrimIds: string[],
    ctx: IUserContext,
  ): Promise<VisaSubmissionEntity>;

  createManifests(id: string, manifests: IManifestsInput, ctx: IUserContext): Promise<VisaSubmissionEntity>;
  review(id: string, status: VerifyStatus, reason: string | null, ctx: IUserContext): Promise<VisaSubmissionEntity>;
}
