import { IUserContext } from '@/shared/utils/rest-api/types';
import {
  FlightManifestEntity,
  HotelManifestEntity,
  PaymentProofSnapshot,
  TransportationManifestEntity,
  VisaSubmissionEntity,
} from '../domain/submission.entity';
import { FlightType, HotelCity, RoomType, TransportType, VerifyStatus } from '@prisma/client';

export interface IVisaSubmissionCreateInput {
  agencySlug: string;
  pilgrimIds: string[];
  rawdahMenTime?: string;
  rawdahWomenTime?: string;
  notes?: string;
  totalAmount: number;
  flights?: (Omit<FlightManifestEntity, 'id' | 'flightDate' | 'eta' | 'etd' | 'type'> & {
    flightDate: Date | string;
    eta: Date | string;
    etd: Date | string;
    type: FlightType | string;
  })[];
  hotels?: (Omit<HotelManifestEntity, 'id' | 'checkIn' | 'checkOut' | 'city' | 'roomType'> & {
    checkIn: Date | string;
    checkOut: Date | string;
    city: HotelCity | string;
    roomType: RoomType | string;
  })[];
  transportations?: (Omit<TransportationManifestEntity, 'id' | 'date' | 'type'> & {
    date: Date | string;
    type: TransportType | string;
  })[];
}

export interface IManifestsInput {
  flights?: (Omit<FlightManifestEntity, 'id' | 'flightDate' | 'eta' | 'etd' | 'type'> & {
    flightDate: Date | string;
    eta: Date | string;
    etd: Date | string;
    type: FlightType | string;
  })[];
  hotels?: (Omit<HotelManifestEntity, 'id' | 'checkIn' | 'checkOut' | 'city' | 'roomType'> & {
    checkIn: Date | string;
    checkOut: Date | string;
    city: HotelCity | string;
    roomType: RoomType | string;
  })[];
  transportations?: (Omit<TransportationManifestEntity, 'id' | 'date' | 'type'> & {
    date: Date | string;
    type: TransportType | string;
  })[];
}

export interface IMemberReview {
  id: string;
  isEligible: boolean;
  rejectionReason?: string | null;
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
  review(
    id: string,
    status: VerifyStatus,
    reason: string | null,
    resultSnapshot: any | null,
    memberReviews: IMemberReview[] | null,
    ctx: IUserContext,
  ): Promise<VisaSubmissionEntity>;
  uploadProof(id: string, proofUrl: string, ocrData: PaymentProofSnapshot | null, ctx: IUserContext): Promise<VisaSubmissionEntity>;
  submitVisas(
    id: string,
    visaFiles: Record<string, { name: string; base64: string }[]>,
    ctx: IUserContext,
  ): Promise<VisaSubmissionEntity>;
}
