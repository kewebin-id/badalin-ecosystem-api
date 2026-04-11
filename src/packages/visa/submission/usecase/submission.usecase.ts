import { IUserContext } from '@/shared/utils/rest-api/types';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FlightType, HotelCity, TransportType, VerifyStatus } from '@prisma/client';
import { VisaSubmissionEntity } from '../domain/submission.entity';
import {
  CreateVisaSubmissionDto,
  PreviewVisaSubmissionDto,
  VisaSubmissionPreviewResponseDto,
} from '../dto/submission.dto';
import { IVisaSubmissionRepository, IVisaSubmissionUseCase } from '../ports';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { VisaSubmissionErrorDto } from '../dto/submission.dto';

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TZ = 'Asia/Jakarta';

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
        notes: dto.notes,
        flights: dto.flights.map((f) => ({
          type: f.type,
          flightNo: f.flightNo,
          carrier: f.carrier,
          flightDate: new Date(f.flightDate),
          eta: new Date(f.eta),
          etd: new Date(f.etd),
          createdBy: ctx.id,
          imageUrls: f.imageUrls,
        })),
        hotels: dto.hotels.map((h) => ({
          name: h.name,
          resvNo: h.resvNo,
          checkIn: new Date(h.checkIn),
          checkOut: new Date(h.checkOut),
          city: h.city,
          roomType: h.roomType,
          createdBy: ctx.id,
          imageUrls: h.imageUrls,
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
          imageUrls: t.imageUrls || [],
        })),
      },
      dto.pilgrimIds,
    );

    return { data: submission };
  }

  async preview(ctx: IUserContext, dto: PreviewVisaSubmissionDto): Promise<VisaSubmissionPreviewResponseDto> {
    const errors: VisaSubmissionErrorDto[] = [];
    const warnings: string[] = [];

    const agency = await this.repository.findAgencyBySlug(dto.agencySlug);
    if (!agency) {
      errors.push({ path: 'agencySlug', message: 'Agency not found' });
    }

    const pilgrims = await this.repository.findPilgrimsByIds(dto.pilgrimIds, ctx);
    if (!pilgrims || pilgrims.length !== dto.pilgrimIds.length) {
      errors.push({ path: 'pilgrimIds', message: 'Some pilgrims not found or access denied' });
    }

    if (pilgrims) {
      pilgrims.forEach((p) => {
        if (!p.isComplete) {
          errors.push({ path: 'pilgrimIds', message: `Pilgrim data is incomplete for ${p.fullName}` });
        }
      });
    }

    const visaPrice = agency ? Number(agency.visaPrice) : 0;
    const pilgrimCount = dto.pilgrimIds.length;
    const totalAmount = visaPrice * pilgrimCount;
    const breakdown = `${visaPrice.toLocaleString('id-ID')} x ${pilgrimCount} pilgrim(s)`;

    if (pilgrimCount >= 6) {
      const isSmallVehicle = dto.transportations.some((t) => t.type === TransportType.TAXI);
      if (isSmallVehicle) {
        warnings.push('Transport capacity warning - Small vehicle (Taxi) detected for 6 or more pilgrims');
      }
    }

    dto.flights.forEach((f, idx) => {
      const pathPrefix = `flights.${idx}`;
      if (!f.flightNo) errors.push({ path: `${pathPrefix}.flightNo`, message: 'Flight No is mandatory' });
      if (!f.carrier) errors.push({ path: `${pathPrefix}.carrier`, message: 'Carrier is mandatory' });

      const eta = dayjs(f.eta);
      const etd = dayjs(f.etd);
      if (eta.isBefore(etd) || eta.isSame(etd)) {
        errors.push({ path: `${pathPrefix}.eta`, message: 'ETA (Arrival) must be after ETD (Departure)' });
      }
      if (!f.imageUrls || f.imageUrls.length === 0) {
        errors.push({ path: `${pathPrefix}.imageUrls`, message: 'E-Ticket image is mandatory' });
      }
    });

    dto.hotels.forEach((h, idx) => {
      const pathPrefix = `hotels.${idx}`;
      if (!h.name) errors.push({ path: `${pathPrefix}.name`, message: 'Hotel Name is mandatory' });
      if (!h.resvNo) errors.push({ path: `${pathPrefix}.resvNo`, message: 'Booking Code (Resv No) is mandatory' });
      if (!h.city) errors.push({ path: `${pathPrefix}.city`, message: 'City is mandatory' });
      if (!h.roomType) errors.push({ path: `${pathPrefix}.roomType`, message: 'Room Type is mandatory' });

      const checkIn = dayjs(h.checkIn);
      const checkOut = dayjs(h.checkOut);
      if (checkIn.isAfter(checkOut) || checkIn.isSame(checkOut)) {
        errors.push({ path: `${pathPrefix}.checkIn`, message: 'Check-In must be before Check-Out' });
      }
      if (!h.imageUrls || h.imageUrls.length === 0) {
        errors.push({ path: `${pathPrefix}.imageUrls`, message: 'Hotel Voucher image is mandatory' });
      }
    });

    dto.transportations.forEach((t, idx) => {
      const pathPrefix = `transportations.${idx}`;
      if (!t.company) {
        errors.push({ path: `${pathPrefix}.company`, message: 'Transport Company is mandatory' });
      }
    });

    if (dto.hotels.length > 0) {
      const sortedHotels = [...dto.hotels].sort((a, b) => dayjs(a.checkIn).valueOf() - dayjs(b.checkIn).valueOf());
      const firstHotel = sortedHotels[0];
      const lastHotel = sortedHotels[sortedHotels.length - 1];

      const firstCheckIn = dayjs(firstHotel.checkIn).tz(DEFAULT_TZ).format('YYYY-MM-DD');
      const lastCheckOut = dayjs(lastHotel.checkOut).tz(DEFAULT_TZ).format('YYYY-MM-DD');

      if (firstHotel.city === HotelCity.MAKKAH) {
        warnings.push('Detected route: Makkah-first');
      } else if (firstHotel.city === HotelCity.MADINAH) {
        warnings.push('Detected route: Madinah-first');
      }

      const departureFlight = dto.flights.find((f) => f.type === FlightType.DEPARTURE);
      if (departureFlight) {
        const depDate = dayjs(departureFlight.eta).tz(DEFAULT_TZ).format('YYYY-MM-DD');
        if (depDate !== firstCheckIn) {
          errors.push({
            path: 'flights.0.eta',
            message: `Departure flight date (${depDate}) must match the first hotel check-in date (${firstCheckIn})`,
          });
        }
      }

      const returnFlight = dto.flights.find((f) => f.type === FlightType.RETURN);
      if (returnFlight) {
        const retDate = dayjs(returnFlight.etd).tz(DEFAULT_TZ).format('YYYY-MM-DD');
        if (retDate !== lastCheckOut) {
          errors.push({
            path: 'flights.1.etd',
            message: `Return flight date (${retDate}) must match the last hotel check-out date (${lastCheckOut})`,
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      totalAmount,
      breakdown,
      errors,
      warnings,
    };
  }

  async getSubmission(id: string, ctx: IUserContext): Promise<VisaSubmissionEntity | null> {
    return this.repository.findById(id, ctx);
  }

  async getTransactions(
    params: { page?: number; limit?: number; search?: string },
    ctx: IUserContext,
  ): Promise<{ data: VisaSubmissionEntity[]; total: number }> {
    return this.repository.findAll(params, ctx);
  }

  async update(id: string, ctx: IUserContext, dto: CreateVisaSubmissionDto): Promise<{ data: VisaSubmissionEntity }> {
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

    const submission = await this.repository.update(
      id,
      {
        leaderId: ctx.id,
        agencySlug: ctx.agencySlug,
        totalAmount,
        resultSnapshot: JSON.parse(JSON.stringify(pilgrims)),
        rawdahMenTime: dto.rawdahMenTime,
        rawdahWomenTime: dto.rawdahWomenTime,
        notes: dto.notes,
        flights: dto.flights.map((f) => ({
          type: f.type,
          flightNo: f.flightNo,
          carrier: f.carrier,
          flightDate: new Date(f.flightDate),
          eta: new Date(f.eta),
          etd: new Date(f.etd),
          createdBy: ctx.id,
          imageUrls: f.imageUrls,
        })),
        hotels: dto.hotels.map((h) => ({
          name: h.name,
          resvNo: h.resvNo,
          checkIn: new Date(h.checkIn),
          checkOut: new Date(h.checkOut),
          city: h.city,
          roomType: h.roomType,
          createdBy: ctx.id,
          imageUrls: h.imageUrls,
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
          imageUrls: t.imageUrls || [],
        })),
      },
      dto.pilgrimIds,
      ctx,
    );

    return { data: submission };
  }
}
