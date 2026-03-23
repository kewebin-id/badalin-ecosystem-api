import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { VisaSubmissionModule } from './visa';
import { AuthModule } from './visa/auth.module';
import { PilgrimModule } from './visa/pilgrim.module';
import { PaymentModule } from './visa/payment.module';
import { DocumentModule } from './visa/document.module';
import { DashboardModule } from './visa/dashboard.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AgencyMiddleware } from '../shared/middleware/agency.middleware';
import { ApiKeyGuard } from '../shared/guards/api-key.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    VisaSubmissionModule,
    AuthModule,
    PilgrimModule,
    PaymentModule,
    DocumentModule,
    DashboardModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AgencyMiddleware)
      .forRoutes('*'); 
  }
}
