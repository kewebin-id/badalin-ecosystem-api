import { Module } from '@nestjs/common';
import { RefundController, RefundRepository, RefundUseCase } from '@/packages/visa/provider/refund';
import { AuthModule } from './auth.module';
import { UploadModule } from '../upload.module';

@Module({
  imports: [UploadModule, AuthModule],
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
