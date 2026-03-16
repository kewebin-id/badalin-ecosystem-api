import { AuthController } from '@/packages/visa/auth/controller/auth.controller';
import { AuthUseCase } from '@/packages/visa/auth/usecase/auth.usecase';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { PrismaAuthRepository } from '@/packages/visa/auth/repository/auth.repository';

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
  controllers: [AuthController],
  providers: [
    {
      provide: 'IAuthUseCase',
      useClass: AuthUseCase,
    },
    {
      provide: 'IAuthRepository',
      useClass: PrismaAuthRepository,
    },
  ],
  exports: [JwtModule, 'IAuthUseCase', 'IAuthRepository'],
})
export class AuthModule {}
