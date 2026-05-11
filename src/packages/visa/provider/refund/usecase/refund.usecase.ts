import { IUserContext } from '@/shared/utils/rest-api/types';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IRefundListItem, IRefundUseCase } from '../ports/refund.usecase.port';
import { IRefundRepository } from '../ports/refund.repository.port';
import { VisaSubmissionEntity } from '@/packages/visa/pilgrim/submission/domain/submission.entity';
import { uploadFile } from '@/shared/utils/upload.util';

@Injectable()
export class RefundUseCase implements IRefundUseCase {
  constructor(
    @Inject('IRefundRepository')
    private readonly repository: IRefundRepository,
  ) {}

  async getRefundList(ctx: IUserContext): Promise<IRefundListItem[]> {
    const submissions = await this.repository.findRefundableSubmissions(ctx);
    const list: IRefundListItem[] = [];

    for (const sub of submissions) {
      const totalMembers = (sub as any)._count?.members || sub.members?.length || 1;
      const amountPerPerson = Number(sub.totalAmount) / totalMembers;

      if (sub.members) {
        for (const pilgrim of sub.members) {
          list.push({
            pilgrimId: pilgrim.id,
            fullName: pilgrim.fullName,
            passportNumber: pilgrim.passportNumber,
            submissionId: sub.id,
            refundAmount: amountPerPerson,
            refundStatus: sub.refundStatus || 'PENDING',
            deadline: sub.refundDeadline,
          });
        }
      }
    }

    return list;
  }

  async settleRefund(submissionId: string, file: string, ctx: IUserContext): Promise<VisaSubmissionEntity> {
    const bucket = process.env.SUPABASE_BUCKET || 'jamaah-docs';
    const proofUrl = await uploadFile(file, bucket, `refunds/${submissionId}/proof-${Date.now()}`);

    return this.repository.settleRefund(submissionId, proofUrl, ctx);
  }
}
