import { Controller, Get, Inject, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { IDashboardUseCase, IHistoryResponse } from '../ports/i.usecase';
import { EVisaRoutes } from '@/shared/constants/routes';
import { response } from '@/shared/utils/rest-api/response';
import { IUsecaseResponse } from '@/shared/utils/rest-api/types';

@Controller(EVisaRoutes.DASHBOARD)
export class DashboardController {
  constructor(
    @Inject('IDashboardUseCase')
    private readonly useCase: IDashboardUseCase,
  ) {}

  @Get('/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PILGRIM)
  async getHistory(@Req() req: Request) {
    const user = req['user'];
    const agencySlug = req.cookies['agency_slug'];

    const result: IUsecaseResponse<IHistoryResponse[]> = await this.useCase.getHistory(user.id, agencySlug);

    if (result.error) {
      return response[result.error.code || 500](null, {
        message: result.error.message,
      });
    }

    return response[200](null, {
      message: 'History fetched successfully',
      data: result.data,
    });
  }
}
