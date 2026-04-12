import { IUserContext } from '@/shared/utils/rest-api/types';
import { VisaSubmissionEntity } from '../domain/submission.entity';
import { PaymentStatus, VerifyStatus } from '@prisma/client';

export interface IVisaSubmissionRepository {
  findById(id: string, ctx?: IUserContext): Promise<VisaSubmissionEntity | null>;
  findAll(
    params: { page?: number; limit?: number; search?: string },
    ctx: IUserContext,
  ): Promise<{ data: VisaSubmissionEntity[]; total: number }>;
  
  create(data: any, ctx: IUserContext): Promise<VisaSubmissionEntity>;
  
  update(
    id: string,
    data: Partial<VisaSubmissionEntity>,
    pilgrimIds: string[],
    ctx: IUserContext,
  ): Promise<VisaSubmissionEntity>;
  
  // Provider specialized methods
  createManifests(id: string, manifests: any, ctx: IUserContext): Promise<VisaSubmissionEntity>;
  review(id: string, status: VerifyStatus, reason: string | null, ctx: IUserContext): Promise<VisaSubmissionEntity>;
}
