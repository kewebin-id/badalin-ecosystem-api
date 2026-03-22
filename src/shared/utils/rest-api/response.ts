import { validationMessage } from '@/shared/constants';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ResponseREST } from './types';

const responseHandlers: Record<number, any> = {
  [HttpStatus.OK]: <T extends Partial<object>>(response: Response, { code, message, data }: ResponseREST<T>) => {
    return response.status(HttpStatus.OK).json({
      code: code || HttpStatus.OK,
      message: message || 'Success!',
      data,
    });
  },
  [HttpStatus.CREATED]: <T extends Partial<object>>(response: Response, { code, message, data }: ResponseREST<T>) => {
    return response.status(HttpStatus.CREATED).json({
      code: code || HttpStatus.CREATED,
      message: message || 'Successfully created!',
      data,
    });
  },
  [HttpStatus.BAD_REQUEST]: <T extends Partial<object>>(
    response: Response,
    { code, message, data }: ResponseREST<T>,
  ) => {
    return response.status(HttpStatus.BAD_REQUEST).json({
      code: code || HttpStatus.BAD_REQUEST,
      message: message || 'Invalid!',
      data,
    });
  },
  [HttpStatus.UNAUTHORIZED]: <T extends Partial<object>>(
    response: Response,
    { code, message, data }: ResponseREST<T>,
  ) => {
    return response.status(HttpStatus.UNAUTHORIZED).json({
      code: code || HttpStatus.UNAUTHORIZED,
      message: message || 'Unauthorized!',
      data,
    });
  },
  [HttpStatus.FORBIDDEN]: <T extends Partial<object>>(response: Response, { code, message, data }: ResponseREST<T>) => {
    return response.status(HttpStatus.FORBIDDEN).json({
      code: code || HttpStatus.FORBIDDEN,
      message: message || 'Failed!',
      data,
    });
  },
  [HttpStatus.NOT_FOUND]: <T extends Partial<object>>(response: Response, { code, message, data }: ResponseREST<T>) => {
    return response.status(HttpStatus.NOT_FOUND).json({
      code: code || HttpStatus.NOT_FOUND,
      message: message || 'Not found!',
      data,
    });
  },
  [HttpStatus.CONFLICT]: <T extends Partial<object>>(response: Response, { code, message, data }: ResponseREST<T>) => {
    return response.status(HttpStatus.CONFLICT).json({
      code: code || HttpStatus.CONFLICT,
      message: message || 'Conflict!',
      data,
    });
  },
  [HttpStatus.UNPROCESSABLE_ENTITY]: <T extends Partial<object>>(
    response: Response,
    { code, message, data }: ResponseREST<T>,
  ) => {
    return response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
      code: code || HttpStatus.UNPROCESSABLE_ENTITY,
      message: message || 'Unprocessable entity!',
      data,
    });
  },
  [HttpStatus.TOO_MANY_REQUESTS]: <T extends Partial<object>>(
    response: Response,
    { code, message, data }: ResponseREST<T>,
  ) => {
    return response.status(HttpStatus.TOO_MANY_REQUESTS).json({
      code: code || HttpStatus.TOO_MANY_REQUESTS,
      message: message || 'Too many requests!',
      data,
    });
  },
  [HttpStatus.INTERNAL_SERVER_ERROR]: <T extends Partial<object>>(response: Response, payload?: ResponseREST<T>) => {
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: payload?.message || validationMessage()[500],
    });
  },
};

export const response = new Proxy(responseHandlers, {
  get(target, prop) {
    const code = Number(prop);
    if (!isNaN(code) && target[code]) {
      return target[code];
    }
    return target[HttpStatus.INTERNAL_SERVER_ERROR];
  },
}) as typeof responseHandlers;
