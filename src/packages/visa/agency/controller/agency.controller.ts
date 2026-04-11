import { Controller, Get, Patch, Query, Body, Req, Inject, UseGuards } from '@nestjs/common';
import { IAgencyUseCase } from '../ports/i.usecase';
import { UpdateAgencyDto } from '../dto/agency.dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';

@Controller('api/v1/p/agency')
export class AgencyController {
  constructor(
    @Inject('IAgencyUseCase')
    private readonly useCase: IAgencyUseCase,
  ) {}

  @Get('check-slug')
  async checkSlug(@Query('slug') slug: string) {
    return this.useCase.checkSlugAvailability(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAgency(@Req() req: any) {
    return this.useCase.getAgencyData(req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateSettings(@Req() req: any, @Body() dto: UpdateAgencyDto) {
    return this.useCase.updateAgencySettings(req.user.email, dto);
  }
}
