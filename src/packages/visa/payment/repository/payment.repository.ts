import { clientDb } from '@/shared/utils/db';
import { PaymentStatus, VerifyStatus, VisaSubmission } from '@prisma/client';
import { IPaymentRepository } from '../ports/i.repository';

export class PrismaPaymentRepository implements IPaymentRepository {
  private readonly db = clientDb;

  findToCancel = async (cutoff: Date): Promise<VisaSubmission[]> => {
    return this.db.visaSubmission.findMany({
      where: {
        createdAt: { lt: cutoff },
        paymentStatus: {
          notIn: [PaymentStatus.CHECKING, PaymentStatus.COMPLETED],
        },
        status: {
          not: VerifyStatus.AUTO_CANCELED,
        },
      },
    });
  };

  cancelTransaction = async (id: string): Promise<void> => {
    await this.db.visaSubmission.update({
      where: { id },
      data: {
        status: VerifyStatus.AUTO_CANCELED,
        verifyStatus: VerifyStatus.AUTO_CANCELED,
      },
    });
  };
}
