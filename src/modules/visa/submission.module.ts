import { PilgrimSubmissionUseCase, VisaSubmissionRepository, PaymentRepository, PaymentScheduler, PilgrimSubmissionController } from '@/packages/visa/pilgrim/submission';
import { VerificationController, VerificationUseCase } from '@/packages/visa/provider/verification';
import { ManifestController, ManifestUseCase } from '@/packages/visa/provider/manifest';
import { AgencyModule } from './agency.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UploadModule } from '../upload.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
    AgencyModule,
    UploadModule,
  ],
  controllers: [
    PilgrimSubmissionController,
    VerificationController,
    ManifestController,
  ],
  providers: [
    {
      provide: 'IVisaSubmissionRepository',
      useClass: VisaSubmissionRepository,
    },
    {
      provide: 'IVerificationUseCase',
      useClass: VerificationUseCase,
    },
    {
      provide: 'IManifestUseCase',
      useClass: ManifestUseCase,
    },
    {
      provide: 'IPilgrimSubmissionUseCase',
      useClass: PilgrimSubmissionUseCase,
    },
    {
      provide: 'IPaymentRepository',
      useClass: PaymentRepository,
    },
    PaymentScheduler,
  ],
  exports: [
    'IVisaSubmissionRepository',
    'IVerificationUseCase',
    'IManifestUseCase',
    'IPilgrimSubmissionUseCase',
    'IPaymentRepository',
  ],
})
export class SubmissionModule {}
