import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PilgrimDashboardController, PilgrimDashboardUseCase, PilgrimDashboardRepository } from '@/packages/visa/pilgrim/dashboard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [PilgrimDashboardController],
  providers: [
    {
      provide: 'IPilgrimDashboardRepository',
      useClass: PilgrimDashboardRepository,
    },
    {
      provide: 'IPilgrimDashboardUseCase',
      useClass: PilgrimDashboardUseCase,
    },
  ],
})
export class DashboardModule {}
