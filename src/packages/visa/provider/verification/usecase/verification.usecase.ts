import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PaymentStatus, VerifyStatus } from '@prisma/client';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { IVerificationUseCase } from '../ports/verification.usecase.port';
import { IVisaSubmissionRepository } from '@/packages/visa/pilgrim/submission/ports/submission.repository.port';
import { VisaSubmissionEntity } from '@/packages/visa/pilgrim/submission/domain/submission.entity';
import { ReviewSubmissionDto } from '../dto/verification.dto';

@Injectable()
export class VerificationUseCase implements IVerificationUseCase {
  constructor(
    @Inject('IVisaSubmissionRepository')
    private readonly repository: IVisaSubmissionRepository,
  ) {}

  private async validateOwnership(id: string, ctx: IUserContext): Promise<VisaSubmissionEntity> {
    const submission = await this.repository.findById(id, ctx);
    if (!submission) {
      throw new HttpException('Submission not found or access denied', HttpStatus.NOT_FOUND);
    }

    if (submission.agencySlug !== ctx.agencySlug) {
      throw new HttpException('Submission ownership mismatch', HttpStatus.FORBIDDEN);
    }

    return submission;
  }

  async findAll(
    params: { page?: number; limit?: number; search?: string },
    ctx: IUserContext,
  ): Promise<{ data: VisaSubmissionEntity[]; total: number }> {
    return this.repository.findAll(params, ctx);
  }

  async verifyPayment(id: string, ctx: IUserContext): Promise<VisaSubmissionEntity> {
    await this.validateOwnership(id, ctx);

    const submission = await this.repository.update(id, {
      paymentStatus: PaymentStatus.COMPLETED,
      verifyStatus: VerifyStatus.IN_REVIEW,
      status: VerifyStatus.IN_REVIEW,
    } as any, [], ctx);

    return submission;
  }

  async review(id: string, dto: ReviewSubmissionDto, ctx: IUserContext): Promise<VisaSubmissionEntity> {
    await this.validateOwnership(id, ctx);

    if (dto.status === VerifyStatus.REJECTED && !dto.rejectionReason) {
      throw new HttpException('Rejection reason is mandatory when status is REJECTED', HttpStatus.BAD_REQUEST);
    }

    return this.repository.review(id, dto.status, dto.rejectionReason || null, ctx);
  }

  async findOne(id: string, ctx: IUserContext): Promise<VisaSubmissionEntity> {
    return this.validateOwnership(id, ctx);
  }
}
