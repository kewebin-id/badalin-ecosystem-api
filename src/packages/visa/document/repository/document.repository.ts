import { clientDb } from '@/shared/utils/db';
import { VisaSubmission } from '@prisma/client';
import { IDocumentRepository } from '../ports/i.repository';

export class PrismaDocumentRepository implements IDocumentRepository {
  private readonly db = clientDb;

  findTransactionById = async (id: string): Promise<VisaSubmission | null> => {
    return this.db.visaSubmission.findUnique({
      where: { id },
    });
  };
}
