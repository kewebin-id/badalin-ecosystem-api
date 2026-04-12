import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { IDocumentUseCase } from '../ports/document.usecase.port';
import { IDocumentRepository } from '../ports/document.repository.port';

@Injectable()
export class PilgrimDocumentUseCase implements IDocumentUseCase {
  constructor(
    @Inject('IDocumentRepository')
    private readonly repository: IDocumentRepository,
  ) {}

  getDownloadUrl = async (transactionId: string): Promise<{ downloadUrl: string }> => {
    const transaction = await this.repository.findTransactionById(transactionId);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.paymentStatus !== PaymentStatus.COMPLETED) {
      throw new ForbiddenException('Download blocked. Transaction status must be COMPLETED.');
    }

    // In a real scenario, this would interface with a secure storage service (e.g. S3 Signed URL)
    return {
      downloadUrl: `https://example.com/visa/${transactionId}.pdf`,
    };
  };
}
