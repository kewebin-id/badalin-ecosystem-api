import { VisaSubmissionEntity } from '../domain/submission.entity';
import { PaymentStatus, VerifyStatus, Pilgrim, Agency } from '@prisma/client';

export interface IVisaSubmissionRepository {
  create: (data: Partial<VisaSubmissionEntity>, memberIds: string[]) => Promise<VisaSubmissionEntity>;
  findById: (id: string) => Promise<VisaSubmissionEntity | null>;
  updateStatus: (id: string, status: VerifyStatus) => Promise<VisaSubmissionEntity>;
  updatePaymentStatus: (id: string, status: PaymentStatus, proofOfPayment?: string) => Promise<VisaSubmissionEntity>;
  findGroupMembers: (leaderId: string) => Promise<Pilgrim[]>;
  findAgencyBySlug: (agencySlug: string) => Promise<Agency | null>;
  findPilgrimsByIds: (ids: string[]) => Promise<Pilgrim[]>;
}
