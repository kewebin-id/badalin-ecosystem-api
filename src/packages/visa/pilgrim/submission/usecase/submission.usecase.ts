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

import { sendSubmissionRegistrationEmail } from '@/shared/utils/mailer';

const RIYADH_TIMEZONE = 'Asia/Riyadh';

export function validateLogistics(data: ISubmissionRequest): ISubmissionError[] {
  const errors: ISubmissionError[] = [];
  const flights = data.flights || [];
  const departureFlight = flights.find((f) => f.type === 'DEPARTURE');
  const returnFlight = flights.find((f) => f.type === 'RETURN');
  
  // 1. Validation Priority: Flight data must be valid first
  if (!departureFlight || !departureFlight.eta) {
    if (!departureFlight) {
      errors.push({ path: 'flights.departure', message: 'Data penerbangan keberangkatan tidak ditemukan.' });
    } else {
      errors.push({ path: 'flights.departure.eta', message: 'Tanggal mendarat (ETA) harus diisi.' });
    }
  }

  if (!returnFlight || !returnFlight.etd) {
    if (!returnFlight) {
      errors.push({ path: 'flights.return', message: 'Data penerbangan kepulangan tidak ditemukan.' });
    } else {
      errors.push({ path: 'flights.return.etd', message: 'Tanggal takeoff (ETD) harus diisi.' });
    }
  }

  if (!departureFlight || !returnFlight || !departureFlight.eta || !returnFlight.etd) {
    return errors;
  }

  // Now we have valid flight boundaries
  const landingDate = dateUtil(departureFlight.eta).tz(RIYADH_TIMEZONE).startOf('day');
  const takeoffDate = dateUtil(returnFlight.etd).tz(RIYADH_TIMEZONE).startOf('day');
  const landingStr = landingDate.format('DD/MM/YYYY');
  const takeoffStr = takeoffDate.format('DD/MM/YYYY');

  const hotels = [...(data.hotels || [])].sort((a, b) => 
    dateUtil(a.checkIn).tz(RIYADH_TIMEZONE).valueOf() - dateUtil(b.checkIn).tz(RIYADH_TIMEZONE).valueOf()
  );

  // 2. Hotel Check (check_in >= landing AND check_out <= takeoff)
  hotels.forEach((hotel, index) => {
    const checkIn = dateUtil(hotel.checkIn).tz(RIYADH_TIMEZONE).startOf('day');
    const checkOut = dateUtil(hotel.checkOut).tz(RIYADH_TIMEZONE).startOf('day');
    const checkInStr = checkIn.format('YYYY-MM-DD');
    const checkOutStr = checkOut.format('YYYY-MM-DD');

    if (checkIn.isBefore(landingDate)) {
      errors.push({
        path: `hotels.${index}.checkIn`,
        message: `Minimal tanggal check-in adalah ${landingStr} (Sesuai landing)`,
      });
    }

    if (checkOut.isAfter(takeoffDate)) {
      errors.push({
        path: `hotels.${index}.checkOut`,
        message: `Maksimal tanggal check-out adalah ${takeoffStr} (Sesuai takeoff)`,
      });
    }

    if (!checkOut.isAfter(checkIn)) {
      errors.push({
        path: `hotels.${index}.checkOut`,
        message: `Tanggal check-out (${checkOutStr}) harus setelah tanggal check-in (${checkInStr})`,
      });
    }

    if (index > 0) {
      const prevHotel = hotels[index - 1];
      const prevCheckOutStr = dateUtil(prevHotel.checkOut).tz(RIYADH_TIMEZONE).format('YYYY-MM-DD');
      
      if (prevCheckOutStr !== checkInStr) {
        errors.push({
          path: `hotels.${index}.checkIn`,
          message: `Zero Gap: Tanggal check-in (${checkInStr}) harus sama dengan check-out hotel sebelumnya (${prevCheckOutStr})`,
        });
      }
    }
  });

  // Specific check for first and last hotel alignment
  if (hotels.length > 0) {
    const firstHotel = hotels[0];
    const lastHotel = hotels[hotels.length - 1];
    
    const flightArrivalDate = landingDate.format('YYYY-MM-DD');
    const firstCheckInDate = dateUtil(firstHotel.checkIn).tz(RIYADH_TIMEZONE).format('YYYY-MM-DD');
    
    if (flightArrivalDate !== firstCheckInDate) {
      errors.push({
        path: 'hotels.0.checkIn',
        message: `Check-in hotel pertama (${firstCheckInDate}) harus sama dengan landing (${flightArrivalDate})`,
      });
    }

    const flightDepartureDate = takeoffDate.format('YYYY-MM-DD');
    const lastCheckOutDate = dateUtil(lastHotel.checkOut).tz(RIYADH_TIMEZONE).format('YYYY-MM-DD');

    if (flightDepartureDate !== lastCheckOutDate) {
      errors.push({
        path: `hotels.${hotels.length - 1}.checkOut`,
        message: `Check-out hotel terakhir (${lastCheckOutDate}) harus sama dengan takeoff (${flightDepartureDate})`,
      });
    }
  }

  // 3. Transport Check (transport_date between landing and takeoff)
  (data.transportations || []).forEach((transport, index) => {
    const transportDate = dateUtil(transport.date).tz(RIYADH_TIMEZONE).startOf('day');
    if (transportDate.isBefore(landingDate) || transportDate.isAfter(takeoffDate)) {
      errors.push({
        path: `transportations.${index}.date`,
        message: `Tanggal transportasi harus berada di antara ${landingStr} dan ${takeoffStr}`,
      });
    }
  });

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

    if (ctx.email) {
      sendSubmissionRegistrationEmail(ctx.email).catch((err) => {
        console.error('Failed to send registration email:', err);
      });
    }

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
