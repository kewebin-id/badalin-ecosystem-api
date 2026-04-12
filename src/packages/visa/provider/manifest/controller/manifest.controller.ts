import { Controller, Post, Body, Inject, UseGuards, Param } from '@nestjs/common';
import { EVisaRoutes, EManifestRoutes } from '@/shared/constants';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { SlugGuard } from '@/shared/guards/slug.guard';
import { ReservedWordGuard } from '@/shared/guards/reserved-word.guard';
import { UserContext } from '@/shared/decorators/user-context.decorator';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { IManifestUseCase } from '../ports/manifest.usecase.port';
import { FlightManifestDto, HotelManifestDto, TransportationManifestDto } from '../dto/manifest.dto';

@Controller(EVisaRoutes.PROVIDER_MANIFEST)
@UseGuards(JwtAuthGuard, SlugGuard, ReservedWordGuard)
export class ManifestController {
  constructor(
    @Inject('IManifestUseCase')
    private readonly useCase: IManifestUseCase,
  ) {}

  @Post(EManifestRoutes.FLIGHT)
  async addFlightManifest(
    @Param('id') id: string,
    @Body() dto: FlightManifestDto[],
    @UserContext() ctx: IUserContext,
  ) {
    return this.useCase.addFlightManifest(id, dto, ctx);
  }

  @Post(EManifestRoutes.HOTEL)
  async addHotelManifest(
    @Param('id') id: string,
    @Body() dto: HotelManifestDto[],
    @UserContext() ctx: IUserContext,
  ) {
    return this.useCase.addHotelManifest(id, dto, ctx);
  }

  @Post(EManifestRoutes.TRANSPORT)
  async addTransportManifest(
    @Param('id') id: string,
    @Body() dto: TransportationManifestDto[],
    @UserContext() ctx: IUserContext,
  ) {
    return this.useCase.addTransportManifest(id, dto, ctx);
  }
}
