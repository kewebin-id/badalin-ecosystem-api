import { Controller, Post, Body, Inject, UseGuards, Param, HttpStatus } from '@nestjs/common';
import { EActorPrefix } from '@/shared/constants';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { SlugGuard } from '@/shared/guards/slug.guard';
import { ReservedWordGuard } from '@/shared/guards/reserved-word.guard';
import { UserContext } from '@/shared/decorators/user-context.decorator';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { IManifestUseCase } from '../ports/manifest.usecase.port';
import { FlightManifestDto, HotelManifestDto, TransportationManifestDto } from '../dto/manifest.dto';

@Controller(EActorPrefix.PROVIDER)
@UseGuards(JwtAuthGuard, SlugGuard, ReservedWordGuard)
export class ManifestController {
  constructor(
    @Inject('IManifestUseCase')
    private readonly useCase: IManifestUseCase,
  ) {}

  @Post('submissions/:id/manifest/flight')
  async addFlightManifest(
    @Param('id') id: string,
    @Body() dto: FlightManifestDto[],
    @UserContext() ctx: IUserContext,
  ) {
    const result = await this.useCase.addFlightManifest(id, dto, ctx);
    return {
      code: HttpStatus.OK,
      message: 'Flight manifest added successfully',
      data: result,
    };
  }

  @Post('submissions/:id/manifest/hotel')
  async addHotelManifest(
    @Param('id') id: string,
    @Body() dto: HotelManifestDto[],
    @UserContext() ctx: IUserContext,
  ) {
    const result = await this.useCase.addHotelManifest(id, dto, ctx);
    return {
      code: HttpStatus.OK,
      message: 'Hotel manifest added successfully',
      data: result,
    };
  }

  @Post('submissions/:id/manifest/transport')
  async addTransportManifest(
    @Param('id') id: string,
    @Body() dto: TransportationManifestDto[],
    @UserContext() ctx: IUserContext,
  ) {
    const result = await this.useCase.addTransportManifest(id, dto, ctx);
    return {
      code: HttpStatus.OK,
      message: 'Transportation manifest added successfully',
      data: result,
    };
  }
}
