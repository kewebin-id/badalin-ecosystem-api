import { VisaSubmissionEntity } from '../domain/submission.entity';
import { SubmitVisaDto } from '../dto/submission.dto';

export interface IVisaSubmissionUseCase {
  create: (
    dto: SubmitVisaDto,
    requesterId: string,
    leaderId: string,
  ) => Promise<{ data?: VisaSubmissionEntity; error?: { message: string; code: number } }>;
  getSubmission: (id: string) => Promise<VisaSubmissionEntity | null>;
}
