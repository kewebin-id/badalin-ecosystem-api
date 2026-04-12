import { EVisaRoutes } from '@/shared/constants/routes';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserContext } from '@/shared/decorators/user-context.decorator';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { PaginationDto } from '@/shared/utils/rest-api/pagination';
import { response } from '@/shared/utils/rest-api/response';
import { IPaginationResponse, IUsecaseResponse, IUserContext } from '@/shared/utils/rest-api/types';
import { Controller, Get, HttpStatus, Inject, Query, Res, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Response } from 'express';
import { IPilgrimDashboardUseCase, IHistoryResponse } from '../ports/dashboard.usecase.port';

@Controller(EVisaRoutes.PILGRIM_DASHBOARD)
@UseGuards(JwtAuthGuard, RolesGuard)
export class PilgrimDashboardController {
  constructor(
    @Inject('IPilgrimDashboardUseCase')
    private readonly useCase: IPilgrimDashboardUseCase,
  ) {}

  @Roles(UserRole.PILGRIM)
  @Get('history')
  async getHistory(@UserContext() ctx: IUserContext, @Query() paginationDto: PaginationDto, @Res() res: Response) {
    const result: IUsecaseResponse<IPaginationResponse<IHistoryResponse>> = await this.useCase.getHistory(
      ctx.id,
      ctx.agencySlug,
      paginationDto,
    );

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
