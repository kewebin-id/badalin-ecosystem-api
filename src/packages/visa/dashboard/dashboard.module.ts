import { Module } from '@nestjs/common';
import { DashboardController } from './controller/dashboard.controller';
import { DashboardUseCase } from './usecase/dashboard.usecase';
import { DashboardRepository } from './repository/dashboard.repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
  controllers: [DashboardController],
  providers: [
    {
      provide: 'IDashboardUseCase',
      useClass: DashboardUseCase,
    },
    {
      provide: 'IDashboardRepository',
      useClass: DashboardRepository,
    },
  ],
  exports: ['IDashboardUseCase'],
})
export class DashboardPackageModule {}
