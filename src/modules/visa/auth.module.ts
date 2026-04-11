import { AdminAuthController } from '@/packages/visa/auth/controller/admin-auth.controller';
import { PilgrimAuthController } from '@/packages/visa/auth/controller/pilgrim-auth.controller';
import { ProviderAuthController } from '@/packages/visa/auth/controller/provider-auth.controller';
import { AdminAuthUseCase } from '@/packages/visa/auth/usecase/admin-auth.usecase';
import { PilgrimAuthUseCase } from '@/packages/visa/auth/usecase/pilgrim-auth.usecase';
import { ProviderAuthUseCase } from '@/packages/visa/auth/usecase/provider-auth.usecase';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { PrismaPilgrimAuthRepository } from '@/packages/visa/auth/repository/pilgrim-auth.repository';
import { PrismaProviderAuthRepository } from '@/packages/visa/auth/repository/provider-auth.repository';

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
  controllers: [PilgrimAuthController, ProviderAuthController, AdminAuthController],
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
      provide: 'IPilgrimAuthRepository',
      useClass: PrismaPilgrimAuthRepository,
    },
    {
      provide: 'IProviderAuthRepository',
      useClass: PrismaProviderAuthRepository,
    },
  ],
  exports: [
    JwtModule,
    'IPilgrimAuthUseCase',
    'IProviderAuthUseCase',
    'IAdminAuthUseCase',
    'IPilgrimAuthRepository',
    'IProviderAuthRepository',
  ],
})
export class AuthModule {}
