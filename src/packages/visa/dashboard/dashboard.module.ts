import { Module } from '@nestjs/common';
import { DashboardController } from './controller/dashboard.controller';
import { DashboardUseCase } from './usecase/dashboard.usecase';
import { DashboardRepository } from './repository/dashboard.repository';

@Module({
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
