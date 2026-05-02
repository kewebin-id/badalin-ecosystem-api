import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { IVisaSubmissionRepository } from '../ports/submission.repository.port';
import { IAgencySettingsRepository } from '@/packages/visa/provider/agency-settings/ports/agency-settings.repository.port';
import { VisaSubmissionEntity } from '../domain/submission.entity';
import { clientDb } from '@/shared/utils/db';

import { IPilgrimSubmissionUseCase } from '../ports/submission.usecase.port';

@Injectable()
export class PilgrimSubmissionUseCase implements IPilgrimSubmissionUseCase {
  constructor(
    @Inject('IVisaSubmissionRepository')
    private readonly repository: IVisaSubmissionRepository,
    @Inject('IAgencySettingsRepository')
    private readonly agencyRepository: IAgencySettingsRepository,
  ) {}

  async submit(data: any, ctx: IUserContext): Promise<VisaSubmissionEntity> {
    const agencySlug = ctx.agencySlug || data.agencySlug;
    if (!agencySlug) {
      throw new HttpException('Agency slug is required', HttpStatus.BAD_REQUEST);
    }

    const agency = await this.agencyRepository.findBySlug(agencySlug);
    if (!agency) {
      throw new HttpException('Agency not found', HttpStatus.NOT_FOUND);
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

  async preview(data: any, ctx: IUserContext): Promise<any> {
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

    const pilgrimIds = data.pilgrimIds || [];
    const totalAmount = pilgrimIds.length * Number(agency.visaPrice);

    const pilgrims = await clientDb.pilgrim.findMany({
      where: { id: { in: pilgrimIds } },
      select: { fullName: true },
    });

    const breakdown = pilgrims.map((p) => p.fullName).join(', ');

    return {
      isValid: true,
      totalAmount,
      breakdown: `Visa for: ${breakdown}`,
      errors: [],
      warnings: [],
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
