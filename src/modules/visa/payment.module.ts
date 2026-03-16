import { PrismaPaymentRepository } from '@/packages/visa/payment/repository/payment.repository';
import { PaymentScheduler } from '@/packages/visa/payment/scheduler/payment.scheduler';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    PaymentScheduler,
    {
      provide: 'IPaymentRepository',
      useClass: PrismaPaymentRepository,
    },
  ],
  exports: [PaymentScheduler],
})
export class PaymentModule {}
