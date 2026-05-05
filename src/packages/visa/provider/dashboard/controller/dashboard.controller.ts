import { EVisaRoutes } from '@/shared/constants';
import { UserContext } from '@/shared/decorators/user-context.decorator';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { ReservedWordGuard } from '@/shared/guards/reserved-word.guard';
import { SlugGuard } from '@/shared/guards/slug.guard';
import { response } from '@/shared/utils/rest-api/response';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { Controller, Get, HttpStatus, Inject, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { IProviderDashboardUseCase } from '../ports/dashboard.usecase.port';

@Controller(EVisaRoutes.PROVIDER_DASHBOARD)
@UseGuards(JwtAuthGuard, SlugGuard, ReservedWordGuard)
export class ProviderDashboardController {
  constructor(
    @Inject('IProviderDashboardUseCase')
    private readonly useCase: IProviderDashboardUseCase,
  ) {}

  @Get('summary')
  async getSummary(@UserContext() ctx: IUserContext, @Res() res: Response) {
    const result = await this.useCase.getSummary(ctx);

    if (result.error) {
      return response[result.error.code || HttpStatus.INTERNAL_SERVER_ERROR](res, {
        message: result.error.message,
      });
    }

    return response[HttpStatus.OK](res, {
      message: 'Dashboard summary fetched successfully',
      data: result.data,
    });
  }
}
