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
    const errors: string[] = [];
    const warnings: string[] = [];

    const agency = await this.repository.findAgencyBySlug(dto.agencySlug);
    if (!agency) {
      errors.push('Agency not found');
    }

    const pilgrims = await this.repository.findPilgrimsByIds(dto.pilgrimIds, ctx);
    if (!pilgrims || pilgrims.length !== dto.pilgrimIds.length) {
      errors.push('Some pilgrims not found or access denied');
    }

    if (pilgrims) {
      pilgrims.forEach((p) => {
        if (!p.isComplete) {
          errors.push(`[${p.id}] Pilgrim data is incomplete for ${p.fullName}`);
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

    if (!dto.rawdahMenTime) {
      errors.push('Rawdah Men Time is mandatory');
    }
    if (!dto.rawdahWomenTime) {
      errors.push('Rawdah Women Time is mandatory');
    }

    dto.flights.forEach((f, idx) => {
      const label = `Flight #${idx + 1} (${f.type})`;
      if (!f.flightNo) errors.push(`${label}: Flight No is mandatory`);
      if (!f.carrier) errors.push(`${label}: Carrier is mandatory`);

      const eta = new Date(f.eta);
      const etd = new Date(f.etd);
      if (eta <= etd) {
        errors.push(`${label}: ETA (Arrival) must be after ETD (Departure)`);
      }
      if (!f.imageUrls || f.imageUrls.length === 0) {
        errors.push(`${label}: E-Ticket image is mandatory`);
      }
    });

    dto.hotels.forEach((h, idx) => {
      const label = `Hotel #${idx + 1} (${h.city})`;
      if (!h.name) errors.push(`${label}: Hotel Name is mandatory`);
      if (!h.resvNo) errors.push(`${label}: Booking Code (Resv No) is mandatory`);
      if (!h.city) errors.push(`${label}: City is mandatory`);
      if (!h.roomType) errors.push(`${label}: Room Type is mandatory`);

      const checkIn = new Date(h.checkIn);
      const checkOut = new Date(h.checkOut);
      if (checkIn >= checkOut) {
        errors.push(`${label}: Check-In must be before Check-Out`);
      }
      if (!h.imageUrls || h.imageUrls.length === 0) {
        errors.push(`${label}: Hotel Voucher image is mandatory`);
      }
    });

    dto.transportations.forEach((t, idx) => {
      const label = `Transportation #${idx + 1} (${t.type})`;
      if (!t.company) {
        errors.push(`${label}: Transport Company is mandatory`);
      }
    });

    if (dto.hotels.length > 0) {
      const sortedHotels = [...dto.hotels].sort(
        (a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime(),
      );
      const firstHotel = sortedHotels[0];
      const lastHotel = sortedHotels[sortedHotels.length - 1];

      const firstCheckIn = new Date(firstHotel.checkIn).toISOString().split('T')[0];
      const lastCheckOut = new Date(lastHotel.checkOut).toISOString().split('T')[0];

      if (firstHotel.city === HotelCity.MAKKAH) {
        warnings.push('Detected route: Makkah-first');
      } else if (firstHotel.city === HotelCity.MADINAH) {
        warnings.push('Detected route: Madinah-first');
      }

      const departureFlight = dto.flights.find((f) => f.type === FlightType.DEPARTURE);
      if (departureFlight) {
        const depDate = new Date(departureFlight.flightDate).toISOString().split('T')[0];
        if (depDate !== firstCheckIn) {
          errors.push(`Departure flight date (${depDate}) must match the first hotel check-in date (${firstCheckIn})`);
        }
      }

      const returnFlight = dto.flights.find((f) => f.type === FlightType.RETURN);
      if (returnFlight) {
        const retDate = new Date(returnFlight.flightDate).toISOString().split('T')[0];
        if (retDate !== lastCheckOut) {
          errors.push(`Return flight date (${retDate}) must match the last hotel check-out date (${lastCheckOut})`);
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
}
