import { VisaSubmissionEntity } from '../domain/submission.entity';
import { PaymentStatus, VerifyStatus, Pilgrim, Agency } from '@prisma/client';
import { IUserContext } from '@/shared/utils/rest-api/types';

export interface IVisaSubmissionRepository {
  create: (data: Partial<VisaSubmissionEntity>, memberIds: string[]) => Promise<VisaSubmissionEntity>;
  findById: (id: string, ctx: IUserContext) => Promise<VisaSubmissionEntity | null>;
  updateStatus: (id: string, status: VerifyStatus, ctx: IUserContext) => Promise<VisaSubmissionEntity>;
  updatePaymentStatus: (
    id: string,
    status: PaymentStatus,
    ctx: IUserContext,
    proofOfPayment?: string,
  ) => Promise<VisaSubmissionEntity>;
  findGroupMembers: (leaderId: string, agencySlug: string) => Promise<Pilgrim[]>;
  findAgencyBySlug: (agencySlug: string) => Promise<Agency | null>;
  findPilgrimsByIds: (ids: string[], ctx: IUserContext) => Promise<Pilgrim[]>;
  findAll: (
    params: { page?: number; limit?: number; search?: string },
    ctx: IUserContext,
  ) => Promise<{ data: VisaSubmissionEntity[]; total: number }>;
  update: (
    id: string,
    data: Partial<VisaSubmissionEntity>,
    memberIds: string[],
    ctx: IUserContext,
  ) => Promise<VisaSubmissionEntity>;
}
