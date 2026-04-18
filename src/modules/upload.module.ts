import { OcrProviderService } from '@/shared/services/ocr-provider.service';
import { OcrService } from '@/shared/services/ocr.service';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UploadController } from '../packages/upload/controller/upload.controller';
import { PrismaUploadRepository } from '../packages/upload/repository/upload.repository';
import { UploadUseCase } from '../packages/upload/usecase/upload.usecase';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secret',
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [UploadController],
  providers: [
    OcrService,
    OcrProviderService,
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
