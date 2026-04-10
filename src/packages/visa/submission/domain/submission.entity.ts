import { PaymentStatus, VerifyStatus, Prisma, RoomType, TransportType, HotelCity, FlightType } from '@prisma/client';

export class FlightManifestEntity {
  id?: string;
  submissionId?: string;
  type: FlightType;
  flightNo: string;
  carrier: string;
  flightDate: Date;
  eta: Date;
  etd: Date;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string | null;
  deletedAt?: Date | null;
  deletedBy?: string | null;

  constructor(partial: Partial<FlightManifestEntity>) {
    Object.assign(this, partial);
    delete this.createdBy;
    delete this.updatedAt;
    delete this.updatedBy;
    delete this.deletedAt;
    delete this.deletedBy;
  }
}

export class HotelManifestEntity {
  id?: string;
  submissionId?: string;
  name: string;
  resvNo: string;
  checkIn: Date;
  checkOut: Date;
  city: HotelCity;
  roomType: RoomType;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string | null;
  deletedAt?: Date | null;
  deletedBy?: string | null;

  constructor(partial: Partial<HotelManifestEntity>) {
    Object.assign(this, partial);
    delete this.createdBy;
    delete this.updatedAt;
    delete this.updatedBy;
    delete this.deletedAt;
    delete this.deletedBy;
  }
}

export class TransportationManifestEntity {
  id?: string;
  submissionId?: string;
  type: TransportType;
  company: string;
  time: string;
  date: Date;
  from?: string | null;
  to?: string | null;
  totalVehicle: number;
  totalH?: number | null;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string | null;
  deletedAt?: Date | null;
  deletedBy?: string | null;

  constructor(partial: Partial<TransportationManifestEntity>) {
    Object.assign(this, partial);
    delete this.createdBy;
    delete this.updatedAt;
    delete this.updatedBy;
    delete this.deletedAt;
    delete this.deletedBy;
  }
}

export class VisaSubmissionEntity {
  id: string;
  leaderId: string;
  agencySlug: string;
  status: VerifyStatus;
  verifyStatus: VerifyStatus;
  verifierId?: string | null;
  verifiedAt?: Date | null;
  resultSnapshot?: Prisma.JsonValue | null;
  anomalyHandled: boolean;
  reimburseTicket?: string | null;
  replenishTicket?: string | null;
  rejectionReason?: string | null;
  paymentStatus: PaymentStatus;
  proofOfPayment?: string | null;
  totalAmount: number;

  rawdahMenTime?: string | null;
  rawdahWomenTime?: string | null;
  notes?: string | null;

  flights?: FlightManifestEntity[];
  hotels?: HotelManifestEntity[];
  transportations?: TransportationManifestEntity[];

  createdAt: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string | null;
  deletedAt?: Date | null;
  deletedBy?: string | null;

  members?: any;
  agency?: { bankName?: string | null; bankAccountName?: string | null; bankAccountNumber?: string | null } | null;

  constructor(partial: Partial<VisaSubmissionEntity>) {
    Object.assign(this, partial);
    delete this.createdBy;
    delete this.updatedAt;
    delete this.updatedBy;
    delete this.deletedAt;
    delete this.deletedBy;
    
    if (this.flights) this.flights = this.flights.map(f => new FlightManifestEntity(f));
    if (this.hotels) this.hotels = this.hotels.map(h => new HotelManifestEntity(h));
    if (this.transportations) this.transportations = this.transportations.map(t => new TransportationManifestEntity(t));

    if (Array.isArray(this.members)) {
      this.members.forEach((m) => {
        delete m.createdBy;
        delete m.updatedAt;
        delete m.updatedBy;
        delete m.deletedAt;
        delete m.deletedBy;
      });
    }
  }
}
