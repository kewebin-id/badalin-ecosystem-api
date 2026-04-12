import { EVisaRoutes, EAuthRoutes } from '@/shared/constants';
import { Public } from '@/shared/decorators/public.decorator';
import { response } from '@/shared/utils/rest-api/response';
import { Body, Controller, HttpStatus, Inject, Logger, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AdminLoginDto } from '../dto/admin-auth.dto';
import { IAdminAuthUseCase } from '../ports/admin-auth.usecase.port';

@Controller(EVisaRoutes.ADMIN_AUTH)
export class AdminAuthController {
  constructor(
    @Inject('IAdminAuthUseCase')
    private readonly adminAuthUseCase: IAdminAuthUseCase,
  ) {}

  @Public()
  @Post(EAuthRoutes.LOGIN)
  async login(@Body() dto: AdminLoginDto, @Res() res: Response) {
    try {
      const responseData = await this.adminAuthUseCase.login(dto);
      if (responseData.error) {
        return response[responseData.error.code || HttpStatus.UNAUTHORIZED](res, {
          message: responseData.error.message || 'Login failed',
        });
      }
      return response[HttpStatus.OK](res, {
        message: 'Admin login successful',
        data: responseData.data,
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error in admin login');
      return response[HttpStatus.UNAUTHORIZED](res, {
        message: 'Login failed',
      });
    }
  }
}
