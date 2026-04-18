import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { IVisaSubmissionRepository } from '../ports/submission.repository.port';
import { VisaSubmissionEntity } from '../domain/submission.entity';

import { IPilgrimSubmissionUseCase } from '../ports/submission.usecase.port';

@Injectable()
export class PilgrimSubmissionUseCase implements IPilgrimSubmissionUseCase {
  constructor(
    @Inject('IVisaSubmissionRepository')
    private readonly repository: IVisaSubmissionRepository,
  ) {}

  async submit(data: any, ctx: IUserContext): Promise<VisaSubmissionEntity> {
    // Basic validation could go here
    return this.repository.create(data, ctx);
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
