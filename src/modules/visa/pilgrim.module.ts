import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PilgrimManagementController, PilgrimManagementUseCase, PilgrimManagementRepository } from '@/packages/visa/pilgrim/pilgrim-management';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [PilgrimManagementController],
  providers: [
    {
      provide: 'IPilgrimManagementRepository',
      useClass: PilgrimManagementRepository,
    },
    {
      provide: 'IPilgrimManagementUseCase',
      useClass: PilgrimManagementUseCase,
    },
  ],
})
export class PilgrimModule {}
