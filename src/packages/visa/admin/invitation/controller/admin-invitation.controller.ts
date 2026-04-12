import { EVisaRoutes, EAuthRoutes } from '@/shared/constants';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserContext } from '@/shared/decorators/user-context.decorator';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { response } from '@/shared/utils/rest-api/response';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { Body, Controller, HttpStatus, Inject, Logger, Post, Res, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Response } from 'express';
import { AdminGenerateInvitationDto } from '../dto/admin-invitation.dto';
import { IAdminInvitationUseCase } from '../ports/admin-invitation.usecase.port';

@Controller(EVisaRoutes.ADMIN_INVITATION)
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminInvitationController {
  constructor(
    @Inject('IAdminInvitationUseCase')
    private readonly adminInvitationUseCase: IAdminInvitationUseCase,
  ) {}

  @Roles(UserRole.SUPERADMIN)
  @Post(EAuthRoutes.GENERATE_INVITATION)
  async generateInvitation(
    @Body() dto: AdminGenerateInvitationDto,
    @Res() res: Response,
    @UserContext() ctx: IUserContext,
  ) {
    try {
      const responseData = await this.adminInvitationUseCase.generateInvitation(dto, ctx.id);
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
