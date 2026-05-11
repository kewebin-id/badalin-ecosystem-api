import { IUserContext } from '@/shared/utils/rest-api/types';
import { VisaSubmissionEntity } from '@/packages/visa/pilgrim/submission/domain/submission.entity';

export interface IRefundListItem {
  pilgrimId: string;
  fullName: string;
  passportNumber: string;
  submissionId: string;
  refundAmount: number;
  refundStatus: string;
  deadline: Date | null;
}

export interface IRefundUseCase {
  getRefundList(
    ctx: IUserContext,
    page?: number,
    limit?: number,
    search?: string,
  ): Promise<{ items: IRefundListItem[]; totalItems: number; totalPages: number; currentPage: number }>;
  settleRefund(submissionId: string, file: string, ctx: IUserContext): Promise<VisaSubmissionEntity>;
}
