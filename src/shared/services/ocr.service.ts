import { Injectable } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
import { createWorker } from 'tesseract.js';
import { globalLogger as Logger } from '../utils/logger';

export type OcrType = 'PASSPORT' | 'KTP' | 'LOGISTICS';

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
}

@Injectable()
export class OcrService {
  async extractData(imageSource: string, type: OcrType = 'PASSPORT'): Promise<OcrResult> {
    let worker: Tesseract.Worker | undefined;
    try {
      Logger.debug(`Starting real OCR extraction for type: ${type}`, 'OcrService');

      let imageBuffer: Buffer | string = imageSource;
      if (imageSource.startsWith('data:')) {
        const base64Data = imageSource.split(';base64,').pop();
        if (base64Data) {
          imageBuffer = Buffer.from(base64Data, 'base64');
          Logger.debug('Base64 image converted to Buffer', 'OcrService');
        }
      }

      worker = await createWorker('ind+eng');
      
      const { data } = await worker.recognize(imageBuffer);
      
      const text = data.text;
      const confidence = data.confidence;

      if (type === 'PASSPORT') {
        return this.parsePassport(text, confidence);
      }

      if (type === 'KTP') {
        return this.parseKtp(text, confidence);
      }

      return this.parseLogistics(text, confidence);
    } catch (error) {
      Logger.error(
        `OCR extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'OcrService.extractData',
      );
      
      return {
        fullName: 'FAILED_TO_EXTRACT',
        rawText: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 0,
      };
    } finally {
      if (worker) {
        await worker.terminate();
        Logger.debug('OCR Worker terminated', 'OcrService');
      }
    }
  }

  private parsePassport(text: string, confidence: number): OcrResult {
    const lines = text.split('\n');
    const result: OcrResult = {
      fullName: '',
      rawText: text,
      confidence,
    };

    const passportNoMatch = text.match(/([A-Z][0-9]{8}|[0-9]{9})/i);
    if (passportNoMatch) result.passportNumber = passportNoMatch[1].toUpperCase();

    const nameLine = lines.find((l) => l.toUpperCase().includes('NAME') || l.toUpperCase().includes('NAMA'));
    if (nameLine) {
      result.fullName = nameLine
        .replace(/NAMA|NAME|FULL/gi, '')
        .replace(/[:;-]/g, '')
        .trim();
    }

    const dates = this.extractDates(text);
    if (dates.length > 0) {
      result.birthDate = dates[0];
      if (dates.length > 1) result.passportExpiry = dates[dates.length - 1];
    }

    return result;
  }

  private parseKtp(text: string, confidence: number): OcrResult {
    const lines = text.split('\n');
    const result: OcrResult = {
      fullName: '',
      rawText: text,
      confidence,
    };

    const nikMatch = text.match(/([0-9]{16})/);
    if (nikMatch) result.nik = nikMatch[1];

    if (text.toUpperCase().includes('LAKI-LAKI')) result.gender = 'LAKI-LAKI';
    else if (text.toUpperCase().includes('PEREMPUAN')) result.gender = 'PEREMPUAN';

    if (text.toUpperCase().includes('BELUM KAWIN')) result.maritalStatus = 'BELUM KAWIN';
    else if (text.toUpperCase().includes('KAWIN')) result.maritalStatus = 'KAWIN';
    else if (text.toUpperCase().includes('CERAI HIDUP')) result.maritalStatus = 'CERAI HIDUP';
    else if (text.toUpperCase().includes('CERAI MATI')) result.maritalStatus = 'CERAI MATI';

    const nameKeywords = ['NAMA', 'NAME'];
    for (const line of lines) {
      if (nameKeywords.some((kw) => line.toUpperCase().includes(kw))) {
        result.fullName = line
          .replace(/NAMA|NAME/gi, '')
          .replace(/[:;-]/g, '')
          .trim();
        break;
      }
    }

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

    if (lowerText.includes('flight') || lowerText.includes('tiket') || lowerText.includes('maskapai')) {
      result.category = 'FLIGHT';
    } else if (lowerText.includes('hotel') || lowerText.includes('voucher') || lowerText.includes('stay')) {
      result.category = 'HOTEL';
    } else {
      result.category = 'OTHER';
    }

    result.amount = this.extractAmount(text);

    const dates = this.extractDates(text);
    if (dates.length > 0) result.date = dates[0];

    const flightMatch = text.match(/([A-Z]{2}[0-9]{3,4})/i);
    if (flightMatch) result.flightNumber = flightMatch[1].toUpperCase();

    const hotelNames = text.match(/Hotel\s+([A-Z\s]+)/i);
    if (hotelNames) result.hotelName = hotelNames[1].trim();

    return result;
  }

  private extractAmount(text: string): number | undefined {
    const normalizedText = text.replace(/[.,\s]/g, '');
    const rupiahPattern = /rp\.?\s*(\d+)/i;
    const rupiahMatch = normalizedText.match(rupiahPattern);
    if (rupiahMatch) return parseInt(rupiahMatch[1], 10);

    const allNumbers = text.match(/\d+/g);
    if (allNumbers) {
      const amounts = allNumbers
        .map((n) => parseInt(n.replace(/[.,]/g, ''), 10))
        .filter((n) => n >= 1000 && n <= 100000000)
        .sort((a, b) => b - a);
      if (amounts.length > 0) return amounts[0];
    }
    return undefined;
  }
}
