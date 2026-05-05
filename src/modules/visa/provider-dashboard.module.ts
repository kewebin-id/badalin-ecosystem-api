import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ProviderDashboardController, ProviderDashboardUseCase, ProviderDashboardRepository } from '@/packages/visa/provider/dashboard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [ProviderDashboardController],
  providers: [
    {
      provide: 'IProviderDashboardRepository',
      useClass: ProviderDashboardRepository,
    },
    {
      provide: 'IProviderDashboardUseCase',
      useClass: ProviderDashboardUseCase,
    },
  ],
})
export class ProviderDashboardModule {}
