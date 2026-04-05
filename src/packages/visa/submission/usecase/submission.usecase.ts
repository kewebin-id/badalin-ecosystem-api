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

    const flightEta = new Date(dto.flightEta).toISOString();
    const flightEtd = new Date(dto.flightEtd).toISOString();
    const hotelCheckin = new Date(dto.hotelCheckin).toISOString();
    const hotelCheckout = new Date(dto.hotelCheckout).toISOString();

    if (hotelCheckin !== flightEta || hotelCheckout !== flightEtd) {
      throw new BadRequestException('Zero Gap Sync Error. Hotel dates must match flight times.');
    }

    if (dto.transportType === 'Avanza/MPV' && dto.tripRoute === 'Bandara-Hotel' && pilgrims.length >= 6) {
      throw new BadRequestException(
        'Smart Transport limit: Avanza/MPV only supports up to 5 passengers for Airport-Hotel route.',
      );
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
        flightEta: new Date(dto.flightEta),
        flightEtd: new Date(dto.flightEtd),
        hotelCheckin: new Date(dto.hotelCheckin),
        hotelCheckout: new Date(dto.hotelCheckout),
        transportType: dto.transportType,
        tripRoute: dto.tripRoute,
        flightNo: dto.flightNo,
        carrier: dto.carrier,
        flightDate: new Date(dto.flightDate),
        hotelMakkahName: dto.hotelMakkahName,
        hotelMadinahName: dto.hotelMadinahName,
        hotelMakkahResvNo: dto.hotelMakkahResvNo,
        hotelMadinahResvNo: dto.hotelMadinahResvNo,
        roomType: dto.roomType,
        busCompany: dto.busCompany,
        busTime: dto.busTime,
        totalBus: dto.totalBus,
        trainDate: new Date(dto.trainDate),
        trainFrom: dto.trainFrom,
        trainTo: dto.trainTo,
        trainTime: dto.trainTime,
        trainTotalH: dto.trainTotalH,
        rawdahMenTime: dto.rawdahMenTime,
        rawdahWomenTime: dto.rawdahWomenTime,
      },
      dto.pilgrimIds,
    );

    return { data: submission };
  }

  async getSubmission(id: string, ctx: IUserContext): Promise<VisaSubmissionEntity | null> {
    return this.repository.findById(id, ctx);
  }
}
