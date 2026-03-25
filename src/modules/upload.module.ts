import { OcrService } from '@/shared/services/ocr.service';
import { Module } from '@nestjs/common';
import { UploadController } from '../packages/upload/controller/upload.controller';
import { PrismaUploadRepository } from '../packages/upload/repository/upload.repository';
import { UploadUseCase } from '../packages/upload/usecase/upload.usecase';

@Module({
  controllers: [UploadController],
  providers: [
    OcrService,
    {
      provide: 'IUploadRepository',
      useClass: PrismaUploadRepository,
    },
    {
      provide: 'IUploadUseCase',
      useClass: UploadUseCase,
    },
  ],
  exports: ['IUploadUseCase'],
})
export class UploadModule {}
