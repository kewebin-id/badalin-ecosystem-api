import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import express from 'express';
import { AppModule } from '../src/modules/app.module';
import { AllExceptionsFilter } from '../src/shared/utils';

const server = express();

let app: any;

const bootstrap = async () => {
  if (!app) {
    app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
      bufferLogs: true,
    });

    const allowedOrigins = process.env.BASE_URL_WEB?.split(',') || ['http://localhost:3000'];

    app.enableCors({
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS Hardening Policy'));
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ limit: '50mb', extended: true }));
    app.use(cookieParser());

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
  }

  return server;
};

export default async (req: any, res: any) => {
  const serverInstance = await bootstrap();
  serverInstance(req, res);
};
