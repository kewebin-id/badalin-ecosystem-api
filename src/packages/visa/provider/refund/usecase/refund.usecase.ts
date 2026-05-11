import { VisaSubmissionEntity } from '@/packages/visa/pilgrim/submission/domain/submission.entity';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { uploadFile } from '@/shared/utils/upload.util';
import { Inject, Injectable } from '@nestjs/common';
import { IRefundRepository } from '../ports/refund.repository.port';
import { IRefundListItem, IRefundUseCase } from '../ports/refund.usecase.port';

@Injectable()
export class RefundUseCase implements IRefundUseCase {
  constructor(
    @Inject('IRefundRepository')
    private readonly repository: IRefundRepository,
  ) {}

  async getRefundList(
    ctx: IUserContext,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ items: IRefundListItem[]; totalItems: number; totalPages: number; currentPage: number }> {
    const submissions = await this.repository.findRefundableSubmissions(ctx);
    let list: IRefundListItem[] = [];

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

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (item) => item.fullName.toLowerCase().includes(s) || item.passportNumber.toLowerCase().includes(s),
      );
    }

    const totalItems = list.length;
    const totalPages = Math.ceil(totalItems / limit);
    const items = list.slice((page - 1) * limit, page * limit);

    return {
      items,
      totalItems,
      totalPages,
      currentPage: page,
    };
  }

  async settleRefund(submissionId: string, file: string, ctx: IUserContext): Promise<VisaSubmissionEntity> {
    const bucket = process.env.SUPABASE_BUCKET || 'jamaah-docs';
    const proofUrl = await uploadFile(file, bucket, `refunds/${submissionId}/proof-${Date.now()}`);

    return this.repository.settleRefund(submissionId, proofUrl, ctx);
  }
}
