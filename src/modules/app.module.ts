import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ApiKeyGuard } from '../shared/guards/api-key.guard';
import { AgencyMiddleware } from '../shared/middleware/agency.middleware';
import { UploadModule } from './upload.module';
import {
  AgencyModule,
  AuthModule,
  DashboardModule,
  DocumentModule,
  PilgrimModule,
  SubmissionModule,
  ProviderDashboardModule,
  RefundModule,
} from './visa';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SubmissionModule,
    AuthModule,
    PilgrimModule,
    DocumentModule,
    DashboardModule,
    ProviderDashboardModule,
    AgencyModule,
    RefundModule,
    UploadModule,
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
    consumer.apply(AgencyMiddleware).forRoutes('*');
  }
}
