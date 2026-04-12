import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AgencySettingsController, AgencySettingsUseCase, AgencySettingsRepository } from '@/packages/visa/provider/agency-settings';
import { ProviderAuthRepository } from '@/packages/visa/provider/auth';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AgencySettingsController],
  providers: [
    {
      provide: 'IAgencySettingsRepository',
      useClass: AgencySettingsRepository,
    },
    {
      provide: 'IAgencySettingsUseCase',
      useClass: AgencySettingsUseCase,
    },
    {
      provide: 'IProviderAuthRepository',
      useClass: ProviderAuthRepository,
    },
  ],
})
export class AgencyModule {}
