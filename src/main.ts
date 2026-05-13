import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });
process.env.TZ = 'Asia/Jakarta';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './modules/app.module';
import { AllExceptionsFilter, dateUtil } from './shared/utils';

dateUtil();

export const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.get(ConfigService);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());

  const port = process.env.PORT || 3000;
  const allowedOrigins = process.env.BASE_URL_WEB?.split(',') || ['http://localhost:3000'];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS Hardening Policy'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (req, res) => {
    res.status(200).json({
      code: 200,
      message: 'Welcome to Badalin Ecosystem API',
    });
  });

  await app.init();

  if (process.env.NODE_ENV !== 'production') {
    await app.listen(port);
  }

  return httpAdapter.getInstance();
};

if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}
