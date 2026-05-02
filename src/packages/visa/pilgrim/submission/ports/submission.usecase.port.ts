import { IUserContext } from '@/shared/utils/rest-api/types';
import { VisaSubmissionEntity } from '../domain/submission.entity';

export interface IPilgrimSubmissionUseCase {
  submit(data: any, ctx: IUserContext): Promise<VisaSubmissionEntity>;
  preview(data: any, ctx: IUserContext): Promise<any>;
  getMySubmissions(ctx: IUserContext): Promise<{ data: VisaSubmissionEntity[]; total: number }>;
  getDetail(id: string, ctx: IUserContext): Promise<VisaSubmissionEntity>;
}
