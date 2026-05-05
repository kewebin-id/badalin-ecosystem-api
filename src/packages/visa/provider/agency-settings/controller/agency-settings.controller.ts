import { EVisaRoutes } from '@/shared/constants';
import { UserContext } from '@/shared/decorators/user-context.decorator';
import { Response } from 'express';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { ReservedWordGuard } from '@/shared/guards/reserved-word.guard';
import { SlugGuard } from '@/shared/guards/slug.guard';
import { response } from '@/shared/utils/rest-api/response';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { Body, Controller, Get, HttpStatus, Inject, Patch, Query, Res, UseGuards } from '@nestjs/common';
import { UpdateAgencySettingsDto } from '../dto/agency-settings.dto';
import { IAgencySettingsUseCase } from '../ports/agency-settings.usecase.port';

@Controller(EVisaRoutes.PROVIDER_AGENCY)
@UseGuards(JwtAuthGuard, SlugGuard, ReservedWordGuard)
export class AgencySettingsController {
  constructor(
    @Inject('IAgencySettingsUseCase')
    private readonly useCase: IAgencySettingsUseCase,
  ) {}

  @Get('check-slug')
  async checkSlug(@Query('slug') slug: string) {
    return this.useCase.checkSlugAvailability(slug);
  }

  @Get()
  async getAgency(@UserContext() ctx: IUserContext) {
    return this.useCase.getAgencyData(ctx.id);
  }

  @Patch()
  async updateSettings(
    @UserContext() ctx: IUserContext,
    @Body() dto: UpdateAgencySettingsDto,
    @Res({ passthrough: true }) responseRes: Response,
  ) {
    try {
      const res = await this.useCase.updateAgencySettings(ctx.id, dto);

      if (res.error) {
        return response[HttpStatus.BAD_REQUEST](responseRes, { message: res.error.message });
      }

      return response[HttpStatus.OK](responseRes, {
        message: 'Agency settings updated successfully',
        data: res.data,
      });
    } catch (error) {
      return response[HttpStatus.INTERNAL_SERVER_ERROR](responseRes, {
        message: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
}
