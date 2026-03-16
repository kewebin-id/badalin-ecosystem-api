import { PilgrimController } from '@/packages/visa/pilgrim/controller/pilgrim.controller';
import { PrismaPilgrimRepository } from '@/packages/visa/pilgrim/repository/pilgrim.repository';
import { PilgrimUseCase } from '@/packages/visa/pilgrim/usecase/pilgrim.usecase';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PilgrimController],
  providers: [
    {
      provide: 'IPilgrimUseCase',
      useClass: PilgrimUseCase,
    },
    {
      provide: 'IPilgrimRepository',
      useClass: PrismaPilgrimRepository,
    },
  ],
  exports: ['IPilgrimUseCase'],
})
export class PilgrimModule {}
