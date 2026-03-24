import { Response } from 'express';
import { SubmitVisaDto } from '../dto/submission.dto';
import { IUserContext } from '@/shared/utils/rest-api/types';

export interface VisaSubmissionControllerPort {
  create: (dto: SubmitVisaDto, ctx: IUserContext, res: Response) => Promise<Response>;
}

export interface VisaSubmissionTransactionControllerPort {
  create: (dto: SubmitVisaDto, ctx: IUserContext, res: Response) => Promise<Response>;
  uploadProof: (id: string, proofUrl: string, ctx: IUserContext, res: Response) => Promise<Response>;
}
