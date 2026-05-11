import { IUserContext } from '@/shared/utils/rest-api/types';
import { VisaSubmissionEntity } from '@/packages/visa/pilgrim/submission/domain/submission.entity';

export interface IRefundRepository {
  findRefundableSubmissions(ctx: IUserContext): Promise<VisaSubmissionEntity[]>;
  settleRefund(id: string, proofUrl: string, ctx: IUserContext): Promise<VisaSubmissionEntity>;
}
