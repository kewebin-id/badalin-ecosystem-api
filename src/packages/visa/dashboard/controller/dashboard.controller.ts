import { Controller, Get, Inject, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { IDashboardUseCase, IHistoryResponse } from '../ports/i.usecase';
import { EVisaRoutes } from '@/shared/constants/routes';
import { response } from '@/shared/utils/rest-api/response';
import { IUsecaseResponse, IUserContext } from '@/shared/utils/rest-api/types';
import { UserContext } from '@/shared/decorators/user-context.decorator';

@Controller(EVisaRoutes.DASHBOARD)
export class DashboardController {
  constructor(
    @Inject('IDashboardUseCase')
    private readonly useCase: IDashboardUseCase,
  ) {}

  @Get('/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PILGRIM)
  async getHistory(@UserContext() ctx: IUserContext, @Res() res: Response) {
    const result: IUsecaseResponse<IHistoryResponse[]> = await this.useCase.getHistory(ctx.id, ctx.agencySlug);

    if (result.error) {
      return response[result.error.code || HttpStatus.INTERNAL_SERVER_ERROR](res, {
        message: result.error.message,
      });
    }

    return response[HttpStatus.OK](res, {
      message: 'History fetched successfully',
      data: result.data,
    });
  }
}
