import { Inject, Injectable } from '@nestjs/common';
import { IUploadUseCase } from '../ports/i.usecase';
import { UploadDto, UploadResult } from '../domain/upload.entity';
import { IUploadRepository } from '../ports/i.repository';
import { OcrResult, OcrService } from '@/shared/services/ocr.service';
import { IUsecaseResponse, globalLogger as Logger } from '@/shared/utils';

@Injectable()
export class UploadUseCase implements IUploadUseCase {
  constructor(
    @Inject('IUploadRepository')
    private readonly repository: IUploadRepository,
    private readonly ocrService: OcrService,
  ) {}

  async execute(dto: UploadDto): Promise<IUsecaseResponse<UploadResult>> {
    try {
      const publicUrl = await this.repository.upload(dto.file, dto.bucket, dto.fileName);
      
      let ocrData: OcrResult | undefined = undefined;
      if (dto.isOcr) {
        ocrData = await this.ocrService.extractData(dto.file, dto.ocrType || 'PASSPORT');
      }

      return {
        data: {
          publicUrl,
          ...(ocrData && { ocr: ocrData }),
        },
      };
    } catch (error) {
      Logger.error('UploadUseCase error:', error);
      return {
        error: {
          message: error instanceof Error ? error.message : 'Upload failed',
          code: 500,
        },
      };
    }
  }
}
