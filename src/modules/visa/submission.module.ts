import { VisaSubmissionController } from '@/packages/visa/submission/controller/submission.controller';
import { TransactionController } from '@/packages/visa/submission/controller/transaction.controller';
import { IVisaSubmissionRepository } from '@/packages/visa/submission/ports/i.repository';
import { PrismaVisaSubmissionRepository } from '@/packages/visa/submission/repository/submission.repository';
import { SubmitVisaUseCase } from '@/packages/visa/submission/usecase/submission.usecase';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [VisaSubmissionController, TransactionController],
  providers: [
    {
      provide: PrismaVisaSubmissionRepository,
      useClass: PrismaVisaSubmissionRepository,
    },
    {
      provide: 'IVisaSubmissionRepository',
      useExisting: PrismaVisaSubmissionRepository,
    },
    {
      provide: 'IVisaSubmissionUseCase',
      useFactory: (repo: IVisaSubmissionRepository) => new SubmitVisaUseCase(repo),
      inject: ['IVisaSubmissionRepository'],
    },
  ],
})
export class VisaSubmissionModule {}
