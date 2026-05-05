import { Controller, Get, Patch, Query, Body, Inject, UseGuards, Param } from '@nestjs/common';
import { EVisaRoutes } from '@/shared/constants';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { SlugGuard } from '@/shared/guards/slug.guard';
import { ReservedWordGuard } from '@/shared/guards/reserved-word.guard';
import { UserContext } from '@/shared/decorators/user-context.decorator';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { IAgencySettingsUseCase } from '../ports/agency-settings.usecase.port';
import { UpdateAgencySettingsDto } from '../dto/agency-settings.dto';

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
  async updateSettings(@UserContext() ctx: IUserContext, @Body() dto: UpdateAgencySettingsDto) {
    return this.useCase.updateAgencySettings(ctx.id, dto);
  }
}
