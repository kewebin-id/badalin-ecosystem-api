import { VisaSubmissionEntity } from '../domain/submission.entity';
import { SubmitVisaDto } from '../dto/submission.dto';
import { IUserContext } from '@/shared/utils/rest-api/types';

export interface IVisaSubmissionUseCase {
  create: (
    ctx: IUserContext,
    dto: SubmitVisaDto,
  ) => Promise<{ data?: VisaSubmissionEntity; error?: { message: string; code: number } }>;
  getSubmission: (id: string, ctx: IUserContext) => Promise<VisaSubmissionEntity | null>;
}
