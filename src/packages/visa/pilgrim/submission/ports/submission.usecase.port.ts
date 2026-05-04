import { IUserContext } from '@/shared/utils/rest-api/types';
import { VisaSubmissionEntity } from '../domain/submission.entity';

export interface ISubmissionError {
  path: string;
  message: string;
}

export interface IPreviewResponse {
  isValid: boolean;
  totalAmount: number;
  breakdown: string;
  errors: ISubmissionError[];
  warnings: string[];
}

export interface ISubmissionRequest {
  agencySlug?: string;
  pilgrimIds: string[];
  rawdahMenTime?: string;
  rawdahWomenTime?: string;
  notes?: string;
  flights: {
    type: 'DEPARTURE' | 'RETURN';
    flightNo: string;
    carrier: string;
    flightDate: string;
    eta: string;
    etd: string;
    imageUrls: string[];
  }[];
  hotels: {
    name: string;
    resvNo: string;
    checkIn: string;
    checkOut: string;
    city: 'MAKKAH' | 'MADINAH';
    roomType: string;
    imageUrls: string[];
  }[];
  transportations: {
    type: 'BUS' | 'TRAIN' | 'TAXI' | 'MPV' | 'OTHER';
    company: string;
    time: string;
    date: string;
    from: string;
    to: string;
    totalVehicle: number;
    totalH?: number | null;
    imageUrls: string[];
  }[];
}

export interface IPilgrimSubmissionUseCase {
  submit(data: ISubmissionRequest, ctx: IUserContext): Promise<{ id: string }>;
  preview(data: ISubmissionRequest, ctx: IUserContext): Promise<IPreviewResponse>;
  getMySubmissions(ctx: IUserContext): Promise<{ data: VisaSubmissionEntity[]; total: number }>;
  getDetail(id: string, ctx: IUserContext): Promise<VisaSubmissionEntity>;
  uploadProof(id: string, file: string, ctx: IUserContext): Promise<VisaSubmissionEntity>;
}
