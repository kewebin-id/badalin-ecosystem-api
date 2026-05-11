import { Module } from '@nestjs/common';
import { RefundController, RefundRepository, RefundUseCase } from '@/packages/visa/provider/refund';
import { UploadModule } from '../upload.module';

@Module({
  imports: [UploadModule],
  controllers: [RefundController],
  providers: [
    {
      provide: 'IRefundRepository',
      useClass: RefundRepository,
    },
    {
      provide: 'IRefundUseCase',
      useClass: RefundUseCase,
    },
  ],
  exports: ['IRefundUseCase'],
})
export class RefundModule {}
