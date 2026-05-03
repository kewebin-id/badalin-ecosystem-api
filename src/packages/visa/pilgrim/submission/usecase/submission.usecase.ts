import { IAgencySettingsRepository } from '@/packages/visa/provider/agency-settings/ports/agency-settings.repository.port';
import { clientDb } from '@/shared/utils/db';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { VisaSubmissionEntity } from '../domain/submission.entity';
import { IVisaSubmissionRepository } from '../ports/submission.repository.port';
import {
  IPilgrimSubmissionUseCase,
  IPreviewResponse,
  ISubmissionError,
  ISubmissionRequest,
} from '../ports/submission.usecase.port';

@Injectable()
export class PilgrimSubmissionUseCase implements IPilgrimSubmissionUseCase {
  constructor(
    @Inject('IVisaSubmissionRepository')
    private readonly repository: IVisaSubmissionRepository,
    @Inject('IAgencySettingsRepository')
    private readonly agencyRepository: IAgencySettingsRepository,
  ) {}

  async submit(data: ISubmissionRequest, ctx: IUserContext): Promise<VisaSubmissionEntity> {
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
    };

    return this.repository.create(submissionData, ctx);
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
}
