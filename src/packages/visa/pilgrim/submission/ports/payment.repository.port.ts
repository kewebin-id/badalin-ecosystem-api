import { VisaSubmission } from '@prisma/client';

export interface IPaymentRepository {
  findToCancel: (cutoff: Date) => Promise<VisaSubmission[]>;
  cancelTransaction: (id: string) => Promise<void>;
}
