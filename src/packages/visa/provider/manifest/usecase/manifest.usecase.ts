import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { IManifestUseCase } from '../ports/manifest.usecase.port';
import { IVisaSubmissionRepository } from '@/packages/visa/pilgrim/submission/ports/submission.repository.port';
import { VisaSubmissionEntity } from '@/packages/visa/pilgrim/submission/domain/submission.entity';
import { FlightManifestDto, HotelManifestDto, TransportationManifestDto } from '../dto/manifest.dto';

@Injectable()
export class ManifestUseCase implements IManifestUseCase {
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

  async addFlightManifest(id: string, dto: FlightManifestDto[], ctx: IUserContext): Promise<VisaSubmissionEntity> {
    const submission = await this.validateOwnership(id, ctx);

    if (submission.paymentStatus !== PaymentStatus.COMPLETED) {
      throw new HttpException('Cannot add manifest until payment is completed', HttpStatus.BAD_REQUEST);
    }

    return this.repository.createManifests(id, { flights: dto as any }, ctx);
  }

  async addHotelManifest(id: string, dto: HotelManifestDto[], ctx: IUserContext): Promise<VisaSubmissionEntity> {
    const submission = await this.validateOwnership(id, ctx);

    if (submission.paymentStatus !== PaymentStatus.COMPLETED) {
      throw new HttpException('Cannot add manifest until payment is completed', HttpStatus.BAD_REQUEST);
    }

    return this.repository.createManifests(id, { hotels: dto as any }, ctx);
  }

  async addTransportManifest(
    id: string,
    dto: TransportationManifestDto[],
    ctx: IUserContext,
  ): Promise<VisaSubmissionEntity> {
    const submission = await this.validateOwnership(id, ctx);

    if (submission.paymentStatus !== PaymentStatus.COMPLETED) {
      throw new HttpException('Cannot add manifest until payment is completed', HttpStatus.BAD_REQUEST);
    }

    return this.repository.createManifests(id, { transportations: dto as any }, ctx);
  }
}
