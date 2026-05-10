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
import { dateUtil } from '@/shared/utils';

export function validateLogistics(data: ISubmissionRequest): ISubmissionError[] {
  const errors: ISubmissionError[] = [];
  const flights = data.flights || [];
  const hotels = [...(data.hotels || [])].sort((a, b) => 
    new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()
  );

  // BR-LOG-001: Departure Flight vs First Hotel Check-in
  // Departure requirement: First Check-in == Flight ETA (Arrival in Saudi)
  const departureFlight = flights.find((f) => f.type === 'DEPARTURE');
  const firstHotel = hotels[0];
  
  if (departureFlight && firstHotel) {
    const flightArrivalDate = dateUtil(departureFlight.flightDate).format('YYYY-MM-DD');
    const checkInDate = dateUtil(firstHotel.checkIn).format('YYYY-MM-DD');
    
    if (flightArrivalDate !== checkInDate) {
      errors.push({
        path: 'departureFlightDate',
        message: `BR-LOG-001: Tanggal kedatangan pesawat (ETA) ${flightArrivalDate} harus sama dengan tanggal check-in hotel pertama ${checkInDate}`,
      });
    }
  }

  // BR-LOG-002 & BR-LOG-003: Hotel Stay Validations
  hotels.forEach((hotel, index) => {
    const checkIn = dateUtil(hotel.checkIn);
    const checkOut = dateUtil(hotel.checkOut);

    // BR-LOG-002: Check-in < Check-out
    if (!checkOut.isAfter(checkIn)) {
      errors.push({
        path: `hotels.${index}.checkOut`,
        message: `BR-LOG-002: Check-out date must be after check-in date for ${hotel.city}`,
      });
    }

    // BR-LOG-003: Zero Gap between hotels
    if (index > 0) {
      const prevHotel = hotels[index - 1];
      const prevCheckOut = dateUtil(prevHotel.checkOut).format('YYYY-MM-DD');
      const currentCheckIn = checkIn.format('YYYY-MM-DD');
      
      if (prevCheckOut !== currentCheckIn) {
        errors.push({
          path: `hotels.${index}.checkIn`,
          message: `BR-LOG-003: Zero gap required. Check-in for ${hotel.city} (${currentCheckIn}) must match check-out from ${prevHotel.city} (${prevCheckOut})`,
        });
      }
    }
  });

  // BR-LOG-004: Latest Hotel Check-out vs Return Flight
  // Return requirement: Last Check-out == Flight ETD (Departure from Saudi)
  const returnFlight = flights.find((f) => f.type === 'RETURN');
  const lastHotel = hotels[hotels.length - 1];

  if (returnFlight && lastHotel) {
    const flightDepartureDate = dateUtil(returnFlight.flightDate).format('YYYY-MM-DD');
    const checkOutDate = dateUtil(lastHotel.checkOut).format('YYYY-MM-DD');

    if (flightDepartureDate !== checkOutDate) {
      errors.push({
        path: 'returnFlightDate',
        message: `BR-LOG-004: Tanggal Check-out hotel terakhir ${checkOutDate} harus sama dengan tanggal keberangkatan pesawat (ETD) ${flightDepartureDate}`,
      });
    }
  }

  return errors;
}

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
      flights: data.flights.map((f) => ({
        ...f,
        from: f.from ?? null,
        to: f.to ?? null,
      })),
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

    const errors: ISubmissionError[] = validateLogistics(data);
    const warnings: string[] = [];

    return {
      isValid: errors.length === 0,
      totalAmount,
      breakdown: `Visa for: ${breakdown}`,
      errors,
      warnings,
    };
  }

  async getMySubmissions(ctx: IUserContext): Promise<{ 
    items: VisaSubmissionEntity[]; 
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }> {
    const limit = 100;
    const page = 1;
    const { data: items, total } = await this.repository.findAll({ page, limit }, ctx);
    
    return {
      items,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
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
