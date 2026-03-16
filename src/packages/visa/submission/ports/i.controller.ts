import { Request, Response } from 'express';
import { SubmitVisaDto } from '../dto/submission.dto';

export interface VisaSubmissionControllerPort {
  create: (dto: SubmitVisaDto, token: string, res: Response) => Promise<Response>;
}

export interface VisaSubmissionTransactionControllerPort {
  create: (dto: SubmitVisaDto, req: Request, res: Response) => Promise<Response>;
  uploadProof: (id: string, proofUrl: string, res: Response) => Promise<Response>;
}
