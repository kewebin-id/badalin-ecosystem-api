import { FlightType, HotelCity, PaymentStatus, RoomType, TransportType, VerifyStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

export class FlightManifestEntity {
  id: string;
  type: FlightType;
  flightNo: string;
  carrier: string;
  flightDate: Date;
  from: string | null;
  to: string | null;
  eta: Date;
  etd: Date;
  imageUrls: string[];
}

export class HotelManifestEntity {
  id: string;
  name: string;
  resvNo: string;
  checkIn: Date;
  checkOut: Date;
  city: HotelCity;
  roomType: RoomType;
  imageUrls: string[];
}

export class TransportationManifestEntity {
  id: string;
  type: TransportType;
  company: string;
  time: string;
  date: Date;
  from: string | null;
  to: string | null;
  totalVehicle: number;
  totalH: number | null;
  imageUrls: string[];
}

export class PilgrimEntity {
  id: string;
  fullName: string;
  passportNumber: string;
  passportExpiry?: Date;
  relation?: string;
  nik?: string;
  gender?: string;
  birthDate?: Date;
  maritalStatus?: string;
  isEligible?: boolean;
  rejectionReason?: string | null;
  photoUrl?: string;
  ktpUrl?: string;
  passportUrl?: string;
}

export interface PaymentProofSnapshot {
  amount?: number;
  date?: string;
  fullName?: string;
  recipientName?: string;
  recipientAccount?: string;
  bankName?: string;
  transferStatus?: string;
  notes?: string;
  rawText?: string;
  confidence?: number;
  message?: string;
  [key: string]: any;
}

export class VisaSubmissionEntity {
  id: string;
  leaderId: string;
  agencySlug: string;
  status: VerifyStatus;
  verifyStatus: VerifyStatus;
  paymentStatus: PaymentStatus;
  totalAmount: Decimal;
  refundAmount: Decimal;
  refundStatus: string | null;
  refundDeadline: Date | null;
  rejectionReason: string | null;
  resultSnapshot: PaymentProofSnapshot | null;

  flights?: FlightManifestEntity[];
  hotels?: HotelManifestEntity[];
  transportations?: TransportationManifestEntity[];
  members?: PilgrimEntity[];
  agency?: {
    bankName: string | null;
    bankAccountName: string | null;
    bankAccountNumber: string | null;
  };
}
