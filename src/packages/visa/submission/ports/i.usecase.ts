import { VisaSubmissionEntity } from '../domain/submission.entity';
import {
  CreateVisaSubmissionDto,
  PreviewVisaSubmissionDto,
  VisaSubmissionPreviewResponseDto,
} from '../dto/submission.dto';
import { IUserContext } from '@/shared/utils/rest-api/types';

export interface IVisaSubmissionUseCase {
  create: (
    ctx: IUserContext,
    dto: CreateVisaSubmissionDto,
  ) => Promise<{ data?: VisaSubmissionEntity; error?: { message: string; code: number } }>;
  preview: (ctx: IUserContext, dto: PreviewVisaSubmissionDto) => Promise<VisaSubmissionPreviewResponseDto>;
  getSubmission: (id: string, ctx: IUserContext) => Promise<VisaSubmissionEntity | null>;
  getTransactions: (
    params: { page?: number; limit?: number; search?: string },
    ctx: IUserContext,
  ) => Promise<{ data: VisaSubmissionEntity[]; total: number }>;
}
