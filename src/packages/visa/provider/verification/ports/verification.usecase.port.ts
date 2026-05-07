import { IUserContext } from '@/shared/utils/rest-api/types';
import { VisaSubmissionEntity } from '../../../pilgrim/submission/domain/submission.entity';
import { ReviewSubmissionDto } from '../dto/verification.dto';

export interface IVerificationUseCase {
  findAll(
    params: { page?: number; limit?: number; search?: string },
    ctx: IUserContext,
  ): Promise<{ 
    items: VisaSubmissionEntity[]; 
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }>;


  verifyPayment(id: string, ctx: IUserContext): Promise<VisaSubmissionEntity>;
  
  review(id: string, dto: ReviewSubmissionDto, ctx: IUserContext): Promise<VisaSubmissionEntity>;

  findOne(id: string, ctx: IUserContext): Promise<VisaSubmissionEntity>;
}
