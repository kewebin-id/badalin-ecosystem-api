import { Module } from '@nestjs/common';
import { DashboardPackageModule } from '@/packages/visa/dashboard/dashboard.module';

@Module({
  imports: [DashboardPackageModule],
  exports: [DashboardPackageModule],
})
export class DashboardModule {}
