import { AdminAuthController, AdminAuthUseCase } from '@/packages/visa/admin/auth';
import { AdminInvitationController, AdminInvitationUseCase } from '@/packages/visa/admin/invitation';
import { PilgrimAuthController, PilgrimAuthUseCase, PilgrimAuthRepository } from '@/packages/visa/pilgrim/auth';
import { ProviderAuthController, ProviderAuthUseCase, ProviderAuthRepository } from '@/packages/visa/provider/auth';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secret',
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [PilgrimAuthController, ProviderAuthController, AdminAuthController, AdminInvitationController],
  providers: [
    {
      provide: 'IPilgrimAuthUseCase',
      useClass: PilgrimAuthUseCase,
    },
    {
      provide: 'IProviderAuthUseCase',
      useClass: ProviderAuthUseCase,
    },
    {
      provide: 'IAdminAuthUseCase',
      useClass: AdminAuthUseCase,
    },
    {
      provide: 'IAdminInvitationUseCase',
      useClass: AdminInvitationUseCase,
    },
    {
      provide: 'IPilgrimAuthRepository',
      useClass: PilgrimAuthRepository,
    },
    {
      provide: 'IProviderAuthRepository',
      useClass: ProviderAuthRepository,
    },
  ],
  exports: [
    JwtModule,
    'IPilgrimAuthUseCase',
    'IProviderAuthUseCase',
    'IAdminAuthUseCase',
    'IAdminInvitationUseCase',
    'IPilgrimAuthRepository',
    'IProviderAuthRepository',
  ],
})
export class AuthModule {}
