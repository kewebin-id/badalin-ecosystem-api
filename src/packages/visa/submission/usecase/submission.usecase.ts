import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { VerifyStatus } from '@prisma/client';
import { VisaSubmissionEntity } from '../domain/submission.entity';
import { CreateVisaSubmissionDto } from '../dto/submission.dto';
import { IVisaSubmissionRepository, IVisaSubmissionUseCase } from '../ports';
import { IUserContext } from '@/shared/utils/rest-api/types';

@Injectable()
export class SubmitVisaUseCase implements IVisaSubmissionUseCase {
  constructor(
    @Inject('IVisaSubmissionRepository')
    private readonly repository: IVisaSubmissionRepository,
  ) {}

  async create(ctx: IUserContext, dto: CreateVisaSubmissionDto): Promise<{ data: VisaSubmissionEntity }> {
    const agency = await this.repository.findAgencyBySlug(ctx.agencySlug);
    if (!agency) {
      throw new NotFoundException('Agency not found');
    }

    const pilgrims = await this.repository.findPilgrimsByIds(dto.pilgrimIds, ctx);
    if (pilgrims.length !== dto.pilgrimIds.length) {
      throw new BadRequestException('Some pilgrims not found or access denied');
    }

    for (const pilgrim of pilgrims) {
      if (!pilgrim.isComplete) {
        throw new BadRequestException(`Pilgrim data is incomplete for ${pilgrim.fullName}`);
      }
    }

    const totalAmount = Number(agency.visaPrice) * pilgrims.length;

    const submission = await this.repository.create(
      {
        leaderId: ctx.id,
        agencySlug: ctx.agencySlug,
        totalAmount,
        resultSnapshot: JSON.parse(JSON.stringify(pilgrims)),
        createdBy: ctx.id,
        status: VerifyStatus.IN_REVIEW,
        rawdahMenTime: dto.rawdahMenTime,
        rawdahWomenTime: dto.rawdahWomenTime,
        flights: dto.flights.map((f) => ({
          flightNo: f.flightNo,
          carrier: f.carrier,
          flightDate: new Date(f.flightDate),
          eta: f.eta ? new Date(f.eta) : null,
          etd: f.etd ? new Date(f.etd) : null,
          createdBy: ctx.id,
        })),
        hotels: dto.hotels.map((h) => ({
          name: h.name,
          resvNo: h.resvNo,
          checkIn: new Date(h.checkIn),
          checkOut: new Date(h.checkOut),
          city: h.city,
          roomType: h.roomType,
          createdBy: ctx.id,
        })),
        transportations: dto.transportations.map((t) => ({
          type: t.type,
          company: t.company,
          time: t.time,
          date: new Date(t.date),
          from: t.from,
          to: t.to,
          totalVehicle: t.totalVehicle,
          totalH: t.totalH,
          createdBy: ctx.id,
        })),
      },
      dto.pilgrimIds,
    );

    return { data: submission };
  }

  async getSubmission(id: string, ctx: IUserContext): Promise<VisaSubmissionEntity | null> {
    return this.repository.findById(id, ctx);
  }
}
