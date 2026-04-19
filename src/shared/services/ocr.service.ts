import * as vision from '@google-cloud/vision';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import sharp from 'sharp';
import { globalLogger as Logger } from '../utils/logger';
import { OcrProviderService } from './ocr-provider.service';

export type OcrType =
  | 'PASSPORT'
  | 'KTP'
  | 'LOGISTICS'
  | 'DEPARTURE_TICKET'
  | 'RETURN_TICKET'
  | 'HOTEL_MECCA'
  | 'HOTEL_MEDINA';

export interface OcrResult {
  fullName: string;
  birthDate?: string;
  passportNumber?: string;
  passportExpiry?: string;
  nik?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  maritalStatus?: string;
  category?: string;
  amount?: number;
  date?: string;
  flightNumber?: string;
  hotelName?: string;
  rawText?: string;
  confidence?: number;
  status?: 'SUCCESS' | 'FAILED_QUALITY' | 'FAILED_CHECKSUM' | 'FAILED_TO_EXTRACT';
  message?: string;
  nusuk_compatibility?: {
    score: number;
    status: 'SAFE' | 'WARNING' | 'REJECTED';
    glare_detected: boolean;
    message: string;
  };
}

@Injectable()
export class OcrService {
  private clientCache: Map<string, vision.ImageAnnotatorClient> = new Map();

  constructor(private readonly providerService: OcrProviderService) {}

  private async getVisionClient(): Promise<{ client: vision.ImageAnnotatorClient; providerId: string }> {
    const provider = await this.providerService.getActiveProvider();

    if (this.clientCache.has(provider.providerId)) {
      return { client: this.clientCache.get(provider.providerId)!, providerId: provider.providerId };
    }

    const client = new vision.ImageAnnotatorClient({
      keyFilename: provider.keyFilename,
      projectId: provider.projectId,
    });

    this.clientCache.set(provider.providerId, client);
    Logger.debug(
      `Google Vision Client initialized for provider: ${provider.providerId} (${provider.keyFilename})`,
      'OcrService',
    );

    return { client, providerId: provider.providerId };
  }

  async extractData(imageSource: string, type: OcrType = 'PASSPORT'): Promise<OcrResult> {
    try {
      Logger.debug(`Starting Real-time OCR (Google Vision) for: ${type}`, 'OcrService');

      let imageBuffer: Buffer;
      if (imageSource.startsWith('data:')) {
        const base64Data = imageSource.split(';base64,').pop();
        imageBuffer = Buffer.from(base64Data || '', 'base64');
      } else if (imageSource.startsWith('http')) {
        imageBuffer = Buffer.from([]); // Placeholder
      } else {
        imageBuffer = Buffer.from(imageSource, 'base64');
      }

      if (type === 'PASSPORT' || type === 'KTP') {
        const quality = await this.validateImageQuality(imageBuffer);
        if (!quality.isValid) {
          return {
            fullName: '',
            status: 'FAILED_QUALITY',
            message: quality.message,
            confidence: 0,
            rawText: '',
            nusuk_compatibility: {
              score: 0,
              status: 'REJECTED',
              glare_detected: true,
              message: quality.message || 'Foto ditolak karena kualitas rendah.',
            },
          };
        }
      }

      const { client, providerId } = await this.getVisionClient();

      // Increment usage count immediately to consume quota regardless of scan result
      this.providerService.incrementUsage(providerId).catch((e) => {
        Logger.error('Failed to increment OCR usage', e instanceof Error ? e.stack : undefined, 'OcrService');
      });

      const [response] = await client.documentTextDetection(imageBuffer);
      const fullTextAnnotation = response.fullTextAnnotation;

      if (!fullTextAnnotation || !fullTextAnnotation.text) {
        throw new Error('No text found in document');
      }

      const text = fullTextAnnotation.text;
      const confidence = (fullTextAnnotation.pages?.[0]?.confidence || 0) * 100;

      let result: OcrResult;

      if (type === 'PASSPORT') {
        result = this.parsePassport(text, confidence);
      } else if (type === 'KTP') {
        result = this.parseKtp(text, confidence);
      } else {
        result = this.parseLogistics(text, confidence);
      }

      return {
        ...result,
        status: result.status || 'SUCCESS',
      };
    } catch (error) {
      Logger.error(
        `Google Vision OCR extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'OcrService.extractData',
      );

      return {
        fullName: 'FAILED_TO_EXTRACT',
        rawText: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 0,
        status: 'FAILED_TO_EXTRACT',
        message: 'Gagal mengekstrak data dari dokumen. Mohon pastikan foto jelas.',
      };
    }
  }

  private parsePassport(text: string, confidence: number): OcrResult {
    const result: OcrResult = {
      fullName: '',
      rawText: text,
      confidence,
    };

    const lines = text.split('\n').map((l) => l.replace(/ /g, '').toUpperCase());

    let mrzString = '';
    for (let i = 0; i < lines.length; i++) {
      const current = lines[i];
      const next = lines[i + 1];
      if (current.startsWith('P<') && current.length >= 40 && next && next.length >= 40) {
        mrzString = current.padEnd(44, '<').substring(0, 44) + next.padEnd(44, '<').substring(0, 44);
        break;
      }
    }

    if (mrzString.length === 88) {
      const line1 = mrzString.substring(0, 44);
      const line2 = mrzString.substring(44, 88);
      return this.decodeMrz(line1, line2, confidence, text);
    }

    // Fallback if MRZ fails
    const passportNoMatch = text.match(/([A-Z][0-9]{8}|[0-9]{9})/i);
    if (passportNoMatch) result.passportNumber = passportNoMatch[1].toUpperCase();

    const dates = this.extractDates(text);
    if (dates.length > 0) {
      result.birthDate = dates[0];
      if (dates.length > 1) result.passportExpiry = dates[dates.length - 1];
    }

    // Handled with rejected compatibility if MRZ not found but requested type is PASSPORT
    result.nusuk_compatibility = {
      score: Math.min(confidence, 70),
      status: 'REJECTED',
      glare_detected: true,
      message: 'Zona MRZ tidak terbaca (Indikasi silau/blur). Silakan foto ulang.',
    };

    return result;
  }

  private decodeMrz(line1: string, line2: string, baseConfidence: number, rawText: string): OcrResult {
    const namePart = line1.substring(5).replace(/</g, ' ').trim();
    const nameSegments = namePart.split('  ').filter((s) => s !== '');
    const fullName = nameSegments.reverse().join(' ').trim();

    const passportNumber = line2.substring(0, 9).replace(/</g, '').toUpperCase();
    const passportCheck = parseInt(line2.substring(9, 10), 10);
    const nationality = line2.substring(10, 13).replace(/</g, '');

    const dobRaw = line2.substring(13, 19);
    const dobCheck = parseInt(line2.substring(19, 20), 10);

    const genderRaw = line2.substring(20, 21);
    const gender = genderRaw === 'M' ? 'LAKI-LAKI' : genderRaw === 'F' ? 'PEREMPUAN' : 'OTHER';

    const expiryRaw = line2.substring(21, 27);

    const isPassportValid = this.calculateChecksum(line2.substring(0, 9)) === passportCheck;
    const isDobValid = this.calculateChecksum(dobRaw) === dobCheck;

    let confidence = baseConfidence;
    let status: any = 'SUCCESS';
    let message: string | undefined = undefined;

    if (!isPassportValid || !isDobValid) {
      status = 'FAILED_CHECKSUM';
      message = 'Data tidak valid (Checksum Error). Pastikan seluruh bagian bawah paspor terlihat jelas.';
      confidence = Math.min(confidence, 40);
    }

    const birthDate = this.formatMrzDate(dobRaw, true);
    const passportExpiry = this.formatMrzDate(expiryRaw, false);

    const result: OcrResult = {
      fullName,
      passportNumber,
      nationality,
      gender,
      birthDate,
      passportExpiry,
      confidence,
      status,
      message,
      rawText,
    };

    // NUSUK COMPATIBILITY SCORING RULES
    // 1. Name readable
    const isNameReadable = fullName.length > 0;
    // 2. Passport readable
    const isPassportNumberReadable = passportNumber.length > 0;
    // 3. MRZ fully parsed (line length 44)
    const isMrzFullLength = line1.length === 44 && line2.length === 44;
    // 4. Expiry Date >= today
    const today = dayjs().startOf('day');
    const expiry = dayjs(passportExpiry);
    const isExpiryValid = expiry.isValid() && (expiry.isAfter(today) || expiry.isSame(today));

    const isValidRequiredFields = isNameReadable && isPassportNumberReadable && isMrzFullLength && isExpiryValid;

    // Calculate Nusuk score based on strict confidence and exact field requirements.
    result.nusuk_compatibility = this.calculateNusukCompatibility(confidence, isPassportValid && isDobValid && isValidRequiredFields);

    return result;
  }

  private calculateNusukCompatibility(confidence: number, isStrictValid: boolean): OcrResult['nusuk_compatibility'] {
    let score = confidence;

    // Checksum failure is a heavy penalty
    if (!isStrictValid) {
      return {
        score: Math.min(score, 75),
        status: 'REJECTED',
        glare_detected: true,
        message: 'Data tidak valid (Nama/No Paspor/Masa Berlaku bermasalah atau Checksum MRZ Gagal). Indikasi pantulan cahaya atau blur parah.',
      };
    }

    if (score >= 95) {
      return {
        score,
        status: 'SAFE',
        glare_detected: false,
        message: 'Data sangat jelas dan lolos validasi Checksum MRZ.',
      };
    } else if (score >= 80) {
      return {
        score,
        status: 'WARNING',
        glare_detected: false,
        message: 'Dokumen terbaca, mohon periksa kembali huruf yang mungkin salah.',
      };
    } else {
      return {
        score,
        status: 'REJECTED',
        glare_detected: true,
        message: 'Tingkat kepercayaan rendah. Silakan foto ulang di tempat yang lebih terang tanpa flash.',
      };
    }
  }

  private calculateChecksum(str: string): number {
    const weights = [7, 3, 1];
    const normalized = this.normalizeMrzChars(str);

    let sum = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized[i].toUpperCase();
      let value = 0;
      if (char >= '0' && char <= '9') value = parseInt(char, 10);
      else if (char >= 'A' && char <= 'Z') value = char.charCodeAt(0) - 55;
      else value = 0;
      sum += value * weights[i % 3];
    }
    return sum % 10;
  }

  private normalizeMrzChars(str: string): string {
    return str
      .toUpperCase()
      .replace(/O|D/g, '0')
      .replace(/I|L|\|/g, '1')
      .replace(/Z/g, '2')
      .replace(/S/g, '5')
      .replace(/B/g, '8');
  }

  private async validateImageQuality(buffer: Buffer): Promise<{ isValid: boolean; message?: string }> {
    try {
      const image = sharp(buffer);
      const { data } = await image.grayscale().raw().toBuffer({ resolveWithObject: true });

      let whitePixels = 0;
      const threshold = 245;
      for (let i = 0; i < data.length; i++) {
        if (data[i] > threshold) whitePixels++;
      }

      if (whitePixels / data.length > 0.15) {
        return { isValid: false, message: 'Foto terdeteksi silau/mantul, silakan foto ulang tanpa flash' };
      }

      const stats = await image.stats();
      if (stats.channels[0].stdev < 15) {
        return { isValid: false, message: 'Foto terdeteksi kurang jelas atau burem, silakan fokuskan kamera' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: true };
    }
  }

  private formatMrzDate(raw: string, isDob: boolean): string {
    const yearShort = parseInt(raw.substring(0, 2), 10);
    const month = raw.substring(2, 4);
    const day = raw.substring(4, 6);
    const currentYear = new Date().getFullYear() % 100;
    const yearPrefix = isDob ? (yearShort > currentYear ? '19' : '20') : yearShort < 50 ? '20' : '19';
    return `${yearPrefix}${yearShort}-${month}-${day}`;
  }

  private parseKtp(text: string, confidence: number): OcrResult {
    const result: OcrResult = {
      fullName: '',
      rawText: text,
      confidence,
    };

    const nikMatch = text.match(/([0-9]{16})/);
    if (nikMatch) result.nik = nikMatch[1];

    if (text.toUpperCase().includes('LAKI-LAKI') || text.toUpperCase().includes('LAKILAKI'))
      result.gender = 'LAKI-LAKI';
    else if (text.toUpperCase().includes('PEREMPUAN')) result.gender = 'PEREMPUAN';

    const lines = text.split('\n');
    const nameKeywords = ['NAMA', 'NAME'];
    for (const line of lines) {
      if (nameKeywords.some((kw) => line.toUpperCase().includes(kw))) {
        result.fullName = line.replace(/NAMA|NAME|[:;]/gi, '').trim();
        break;
      }
    }

    // Nusuk Compatibility for KTP (Simple confidence check as no MRZ)
    result.nusuk_compatibility = this.calculateNusukCompatibility(confidence, !!result.nik);

    return result;
  }

  private extractDates(text: string): string[] {
    const dates: string[] = [];
    const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
    const matches = text.match(new RegExp(datePattern, 'g'));

    if (matches) {
      matches.forEach((m) => {
        const parts = m.split(/[\/\-]/);
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        if (year > 1900 && year < 2100) {
          dates.push(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
        }
      });
    }
    return dates;
  }

  private parseLogistics(text: string, confidence: number): OcrResult {
    const lowerText = text.toLowerCase();
    const result: OcrResult = {
      fullName: '',
      rawText: text,
      confidence,
    };

    if (lowerText.includes('flight') || lowerText.includes('tiket')) result.category = 'FLIGHT';
    else if (lowerText.includes('hotel') || lowerText.includes('voucher')) result.category = 'HOTEL';
    else result.category = 'OTHER';

    const dates = this.extractDates(text);
    if (dates.length > 0) result.date = dates[0];

    const flightMatch = text.match(/([A-Z]{2}[0-9]{3,4})/i);
    if (flightMatch) result.flightNumber = flightMatch[1].toUpperCase();

    const hotelNames = text.match(/Hotel\s+([A-Z\s]+)/i);
    if (hotelNames) result.hotelName = hotelNames[1].trim();

    return result;
  }
}
