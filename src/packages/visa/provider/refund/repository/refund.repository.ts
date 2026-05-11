import { clientDb } from '@/shared/utils/db';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { Injectable } from '@nestjs/common';
import { IRefundRepository } from '../ports/refund.repository.port';
import { VisaSubmissionEntity } from '@/packages/visa/pilgrim/submission/domain/submission.entity';
import { AgencyStatus } from '@prisma/client';

@Injectable()
export class RefundRepository implements IRefundRepository {
  private readonly db = clientDb;

  async findRefundableSubmissions(ctx: IUserContext): Promise<VisaSubmissionEntity[]> {
    const results = await this.db.visaSubmission.findMany({
      where: {
        agencySlug: ctx.agencySlug,
        paymentStatus: 'COMPLETED',
        members: {
          some: {
            isEligible: false,
          },
        },
      },
      include: {
        members: {
          where: {
            isEligible: false,
          },
          select: {
            id: true,
            fullName: true,
            passportNumber: true,
            isEligible: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return results as unknown as VisaSubmissionEntity[];
  }

  async settleRefund(id: string, proofUrl: string, ctx: IUserContext): Promise<VisaSubmissionEntity> {
    return this.db.$transaction(async (tx) => {
      const submission = await tx.visaSubmission.update({
        where: { id },
        data: {
          refundStatus: 'SETTLED',
          proofOfRefund: proofUrl,
          updatedBy: ctx.id,
        },
        include: { agency: true },
      });

      const overdueCount = await tx.visaSubmission.count({
        where: {
          agencySlug: submission.agencySlug,
          refundStatus: 'PENDING',
          refundDeadline: {
            lt: new Date(),
          },
        },
      });

      if (overdueCount === 0 && submission.agency.status === AgencyStatus.RESTRICTED) {
        await tx.agency.update({
          where: { slug: submission.agencySlug },
          data: {
            status: AgencyStatus.ACTIVE,
            updatedBy: ctx.id,
          },
        });
      }

      return submission as unknown as VisaSubmissionEntity;
    });
  }
}
