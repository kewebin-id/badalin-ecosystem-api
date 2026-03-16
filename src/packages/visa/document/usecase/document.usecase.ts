import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { IDocumentUseCase } from '../ports/i.usecase';
import { IDocumentRepository } from '../ports/i.repository';

@Injectable()
export class DocumentUseCase implements IDocumentUseCase {
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

    return {
      downloadUrl: `https://example.com/visa/${transactionId}.pdf`,
    };
  };
}
