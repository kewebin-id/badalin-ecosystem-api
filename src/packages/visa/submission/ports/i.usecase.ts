import { VisaSubmissionEntity } from '../domain/submission.entity';
import { CreateVisaSubmissionDto } from '../dto/submission.dto';
import { IUserContext } from '@/shared/utils/rest-api/types';

export interface IVisaSubmissionUseCase {
  create: (
    ctx: IUserContext,
    dto: CreateVisaSubmissionDto,
  ) => Promise<{ data?: VisaSubmissionEntity; error?: { message: string; code: number } }>;
  getSubmission: (id: string, ctx: IUserContext) => Promise<VisaSubmissionEntity | null>;
}
