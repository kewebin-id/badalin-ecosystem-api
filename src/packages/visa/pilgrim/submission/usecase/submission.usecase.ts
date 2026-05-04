import { IAgencySettingsRepository } from '@/packages/visa/provider/agency-settings/ports/agency-settings.repository.port';
import { clientDb } from '@/shared/utils/db';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PaymentProofSnapshot, VisaSubmissionEntity } from '../domain/submission.entity';
import { IVisaSubmissionRepository } from '../ports/submission.repository.port';
import {
  IPilgrimSubmissionUseCase,
  IPreviewResponse,
  ISubmissionError,
  ISubmissionRequest,
} from '../ports/submission.usecase.port';

import { IUploadUseCase } from '@/packages/upload/ports/i.usecase';

@Injectable()
export class PilgrimSubmissionUseCase implements IPilgrimSubmissionUseCase {
  constructor(
    @Inject('IVisaSubmissionRepository')
    private readonly repository: IVisaSubmissionRepository,
    @Inject('IAgencySettingsRepository')
    private readonly agencyRepository: IAgencySettingsRepository,
    @Inject('IUploadUseCase')
    private readonly uploadUseCase: IUploadUseCase,
  ) {}

  async submit(data: ISubmissionRequest, ctx: IUserContext): Promise<{ id: string }> {
    const agencySlug = ctx.agencySlug || data.agencySlug;
    if (!agencySlug) {
      throw new HttpException('Agency slug is required', HttpStatus.BAD_REQUEST);
    }

    const agency = await this.agencyRepository.findBySlug(agencySlug);
    if (!agency) {
      throw new HttpException('Agency not found', HttpStatus.NOT_FOUND);
    }

    if (agency.slug.startsWith('temp-')) {
      throw new HttpException('This agency is not yet active (slug setup required)', HttpStatus.FORBIDDEN);
    }

    const pilgrimIds = data.pilgrimIds || [];
    const totalAmount = pilgrimIds.length * Number(agency.visaPrice);

    const submissionData = {
      ...data,
      agencySlug,
      totalAmount,
      transportations: data.transportations.map((t) => ({
        ...t,
        totalH: t.totalH ?? null,
      })),
    };

    const submission = await this.repository.create(submissionData, ctx);
    return { id: submission.id };
  }

  async preview(data: ISubmissionRequest, ctx: IUserContext): Promise<IPreviewResponse> {
    const agencySlug = ctx.agencySlug || data.agencySlug;
    if (!agencySlug) {
      return {
        isValid: false,
        totalAmount: 0,
        breakdown: '',
        errors: [{ path: 'agencySlug', message: 'Agency slug is required' }],
        warnings: [],
      };
    }

    const agency = await this.agencyRepository.findBySlug(agencySlug);
    if (!agency) {
      return {
        isValid: false,
        totalAmount: 0,
        breakdown: '',
        errors: [{ path: 'agency', message: 'Agency not found' }],
        warnings: [],
      };
    }

    if (agency.slug.startsWith('temp-')) {
      return {
        isValid: false,
        totalAmount: 0,
        breakdown: '',
        errors: [
          {
            path: 'agency',
            message: 'This agency is not yet active (slug setup required)',
          },
        ],
        warnings: [],
      };
    }

    const pilgrimIds = data.pilgrimIds || [];
    const totalAmount = pilgrimIds.length * Number(agency.visaPrice);

    const pilgrims = await clientDb.pilgrim.findMany({
      where: { id: { in: pilgrimIds } },
      select: { fullName: true },
    });

    const breakdown = pilgrims.map((p) => p.fullName).join(', ');

    const errors: ISubmissionError[] = [];
    const warnings: string[] = [];

    const flights = data.flights || [];
    const hotels = data.hotels || [];

    const returnFlight = flights.find((f) => f.type === 'RETURN');
    const returnDate = returnFlight?.flightDate ? new Date(returnFlight.flightDate).toISOString().split('T')[0] : null;

    let latestCheckout: string | null = null;
    hotels.forEach((h) => {
      if (h.checkOut) {
        const checkoutDate = new Date(h.checkOut).toISOString().split('T')[0];
        if (!latestCheckout || checkoutDate > latestCheckout) {
          latestCheckout = checkoutDate;
        }
      }
    });

    if (returnDate && latestCheckout && returnDate !== latestCheckout) {
      errors.push({
        path: 'returnFlightDate',
        message: `BR-LOG-004: Return flight date (${returnDate}) must match the latest hotel check-out date (${latestCheckout})`,
      });
    }

    return {
      isValid: errors.length === 0,
      totalAmount,
      breakdown: `Visa for: ${breakdown}`,
      errors,
      warnings,
    };
  }

  async getMySubmissions(ctx: IUserContext): Promise<{ data: VisaSubmissionEntity[]; total: number }> {
    return this.repository.findAll({ page: 1, limit: 100 }, ctx);
  }

  async getDetail(id: string, ctx: IUserContext): Promise<VisaSubmissionEntity> {
    const submission = await this.repository.findById(id, ctx);
    if (!submission || submission.leaderId !== ctx.id) {
      throw new HttpException('Submission not found', HttpStatus.NOT_FOUND);
    }
    return submission;
  }

  async uploadProof(id: string, file: string, ctx: IUserContext): Promise<VisaSubmissionEntity> {
    const submission = await this.repository.findById(id, ctx);
    if (!submission || submission.leaderId !== ctx.id) {
      throw new HttpException('Submission not found', HttpStatus.NOT_FOUND);
    }

    const { data, error } = await this.uploadUseCase.execute({
      file,
      fileName: `submissions/${id}/payment-proof`,
      isOcr: true,
      ocrType: 'PAYMENT_PROOF',
    });

    if (error || !data) {
      throw new HttpException(error?.message || 'Upload failed', error?.code || HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const ocrResult: PaymentProofSnapshot | null = data.ocr
      ? {
          amount: data.ocr.amount,
          date: data.ocr.date,
          fullName: data.ocr.fullName,
          recipientName: data.ocr.recipientName,
          recipientAccount: data.ocr.recipientAccount,
          bankName: data.ocr.bankName,
          transferStatus: data.ocr.transferStatus,
          notes: data.ocr.notes,
          rawText: data.ocr.rawText,
          confidence: data.ocr.confidence,
          message: data.ocr.message,
        }
      : null;

    return this.repository.uploadProof(id, data.publicUrl, ocrResult, ctx);
  }
}
