import { ResponseREST } from '@/shared/utils/rest-api/types';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { validationMessage } from '../constants';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = validationMessage()[500]();

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null && 'message' in res) {
        const msg = (res as Record<string, unknown>).message;
        message = Array.isArray(msg) ? msg?.[0] : (msg as string);
      }
    }

    const payload: ResponseREST<undefined> = {
      code: status,
      message,
    };

    response.status(status).json(payload);
  }
}
