import { VisaSubmissionEntity } from '@/packages/visa/pilgrim/submission/domain/submission.entity';
import { IVisaSubmissionRepository } from '@/packages/visa/pilgrim/submission/ports/submission.repository.port';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { uploadFile } from '@/shared/utils/upload.util';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PaymentStatus, VerifyStatus } from '@prisma/client';
import { ReviewSubmissionDto } from '../dto/verification.dto';
import { IVerificationUseCase } from '../ports/verification.usecase.port';

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
  ): Promise<{
    items: VisaSubmissionEntity[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const { data: items, total } = await this.repository.findAll({ ...params, page, limit }, ctx);

    return {
      items,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async verifyPayment(id: string, ctx: IUserContext): Promise<VisaSubmissionEntity> {
    await this.validateOwnership(id, ctx);

    const submission = await this.repository.update(
      id,
      {
        paymentStatus: PaymentStatus.COMPLETED,
        reviewStatus: VerifyStatus.IN_REVIEW,
        status: VerifyStatus.IN_REVIEW,
      } as Partial<VisaSubmissionEntity>,
      [],
      ctx,
    );

    return submission;
  }

  async review(id: string, dto: ReviewSubmissionDto, ctx: IUserContext): Promise<VisaSubmissionEntity> {
    await this.validateOwnership(id, ctx);

    if (dto.status === VerifyStatus.REJECTED && !dto.rejectionReason) {
      throw new HttpException('Rejection reason is mandatory when status is REJECTED', HttpStatus.BAD_REQUEST);
    }

    return this.repository.review(
      id,
      dto.status,
      dto.rejectionReason || null,
      dto.resultSnapshot || null,
      dto.members || null,
      ctx,
    );
  }

  async findOne(id: string, ctx: IUserContext): Promise<VisaSubmissionEntity> {
    return this.validateOwnership(id, ctx);
  }

  async uploadVisas(
    id: string,
    visaFiles: Record<string, { name: string; base64: string }[]>,
    ctx: IUserContext,
  ): Promise<Record<string, string>> {
    await this.validateOwnership(id, ctx);

    const visaUrls: Record<string, string> = {};

    await Promise.all(
      Object.entries(visaFiles).map(async ([memberId, files]) => {
        if (files && files.length > 0 && files[0].base64) {
          try {
            const bucket = process.env.SUPABASE_BUCKET || 'jamaah-docs';
            const url = await uploadFile(files[0].base64, bucket, `visa-${id}-${memberId}`);
            visaUrls[memberId] = url;
          } catch (uploadError: any) {
            console.error(
              `[UploadVisas] Failed to upload for member ${memberId}:`,
              uploadError?.message || uploadError,
            );
            throw new HttpException(
              `Failed to upload visa for member ${memberId}: ${uploadError?.message || 'Unknown error'}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }
      }),
    );

    return visaUrls;
  }

  async submitVisas(id: string, visaUrls: Record<string, string>, ctx: IUserContext): Promise<VisaSubmissionEntity> {
    const submission = await this.validateOwnership(id, ctx);

    if (submission.paymentStatus !== PaymentStatus.COMPLETED) {
      throw new HttpException('Cannot issue visas: Payment has not been completed', HttpStatus.BAD_REQUEST);
    }

    return this.repository.submitVisas(id, visaUrls, ctx);
  }
}
