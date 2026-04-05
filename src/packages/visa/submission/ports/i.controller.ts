import { Response } from 'express';
import { CreateVisaSubmissionDto } from '../dto/submission.dto';
import { IUserContext } from '@/shared/utils/rest-api/types';

export interface VisaSubmissionControllerPort {
  create: (dto: CreateVisaSubmissionDto, ctx: IUserContext, res: Response) => Promise<Response>;
}

export interface VisaSubmissionTransactionControllerPort {
  create: (dto: CreateVisaSubmissionDto, ctx: IUserContext, res: Response) => Promise<Response>;
  uploadProof: (id: string, proofUrl: string, ctx: IUserContext, res: Response) => Promise<Response>;
}
