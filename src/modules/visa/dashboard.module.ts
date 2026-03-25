import { DashboardController } from '@/packages/visa/dashboard/controller/dashboard.controller';
import { DashboardRepository } from '@/packages/visa/dashboard/repository/dashboard.repository';
import { DashboardUseCase } from '@/packages/visa/dashboard/usecase/dashboard.usecase';
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
export class DashboardModule {}
