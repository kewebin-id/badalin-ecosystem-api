import { PaymentStatus, VerifyStatus, Prisma } from '@prisma/client';

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
  flightEta?: Date | null;
  flightEtd?: Date | null;
  hotelCheckin?: Date | null;
  hotelCheckout?: Date | null;
  transportType?: string | null;
  tripRoute?: string | null;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy?: string | null;
  deletedAt?: Date | null;
  deletedBy?: string | null;

  constructor(partial: Partial<VisaSubmissionEntity>) {
    Object.assign(this, partial);
  }
}
