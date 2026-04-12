import { VisaSubmission } from '@prisma/client';

export interface IDocumentRepository {
  findTransactionById: (id: string) => Promise<VisaSubmission | null>;
}
