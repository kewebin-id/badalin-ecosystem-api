import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AgencyController } from '@/packages/visa/agency/controller/agency.controller';
import { AgencyUseCase } from '@/packages/visa/agency/usecase/agency.usecase';
import { PrismaAgencyRepository } from '@/packages/visa/agency/repository/agency.repository';
import { PrismaProviderAuthRepository } from '@/packages/visa/auth/repository/provider-auth.repository';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AgencyController],
  providers: [
    {
      provide: 'IAgencyRepository',
      useClass: PrismaAgencyRepository,
    },
    {
      provide: 'IAgencyUseCase',
      useClass: AgencyUseCase,
    },
    {
      provide: 'IProviderAuthRepository',
      useClass: PrismaProviderAuthRepository,
    },
  ],
})
export class AgencyModule {}
