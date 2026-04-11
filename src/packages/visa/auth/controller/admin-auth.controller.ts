import { EAuthRoutes, EVisaRoutes } from '@/shared/constants';
import { Public } from '@/shared/decorators/public.decorator';
import { Roles } from '@/shared/decorators/roles.decorator';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { response } from '@/shared/utils/rest-api/response';
import { Body, Controller, HttpStatus, Inject, Logger, Post, Res, UseGuards, Req } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Response } from 'express';
import { AdminGenerateInvitationDto, AdminLoginDto } from '../dto/admin-auth.dto';
import { IAdminAuthUseCase } from '../ports/i-admin-auth.usecase';

@Controller(EVisaRoutes.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminAuthController {
  constructor(
    @Inject('IAdminAuthUseCase')
    private readonly adminUseCase: IAdminAuthUseCase,
  ) {}

  @Public()
  @Post(EAuthRoutes.LOGIN)
  async login(@Body() dto: AdminLoginDto, @Res() res: Response) {
    try {
      const responseData = await this.adminUseCase.login(dto);
      if (responseData.error) {
        return response[responseData.error.code || HttpStatus.UNAUTHORIZED](res, {
          message: responseData.error.message || 'Login failed',
        });
      }
      return response[HttpStatus.OK](res, {
        message: 'Admin login successful. Welcome to Badalin Ecosystem Control Center',
        data: responseData.data,
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error in admin login');
      return response[HttpStatus.UNAUTHORIZED](res, {
        message: 'Login failed',
      });
    }
  }

  @Roles(UserRole.SUPERADMIN)
  @Post(EAuthRoutes.GENERATE_INVITATION)
  async generateInvitation(@Body() dto: AdminGenerateInvitationDto, @Res() res: Response, @Req() req: any) {
    try {
      const adminId = req.user?.id;
      const responseData = await this.adminUseCase.generateInvitation(dto, adminId);
      if (responseData.error) {
        return response[responseData.error.code || HttpStatus.INTERNAL_SERVER_ERROR](res, {
          message: responseData.error.message || 'Failed to generate invitation',
        });
      }
      return response[HttpStatus.OK](res, {
        message: 'Invitation generated and sent successfully',
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error in generateInvitation');
      return response[HttpStatus.INTERNAL_SERVER_ERROR](res, {
        message: 'Failed to generate invitation',
      });
    }
  }
}
