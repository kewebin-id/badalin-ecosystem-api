import { OcrResult, OcrType } from '@/shared/services/ocr.service';

export interface UploadDto {
  file: string;
  bucket?: string;
  fileName?: string;
  isOcr?: boolean;
  ocrType?: OcrType;
}

export interface UploadResult {
  publicUrl: string;
  ocr?: OcrResult;
}
