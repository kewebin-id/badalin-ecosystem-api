import { EVisaRoutes } from '@/shared/constants/routes';
import { UserContext } from '@/shared/decorators/user-context.decorator';
import { ApiKeyGuard } from '@/shared/guards/api-key.guard';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { IUserContext } from '@/shared/utils/rest-api/types';
import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CreatePilgrimDto, UpdatePilgrimDto } from '../dto/pilgrim-management.dto';
import { IPilgrimManagementUseCase } from '../ports/pilgrim-management.usecase.port';
import { Roles } from '@/shared/decorators/roles.decorator';

@Controller(EVisaRoutes.PILGRIM_MANAGEMENT)
@UseGuards(ApiKeyGuard, JwtAuthGuard, RolesGuard)
@Roles(UserRole.PILGRIM)
export class PilgrimManagementController {
  constructor(
    @Inject('IPilgrimManagementUseCase')
    private readonly usecase: IPilgrimManagementUseCase,
  ) {}

  @Get()
  async getPilgrims(
    @UserContext() ctx: IUserContext,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const result = await this.usecase.getPilgrims(ctx.id, page, limit, search);
    if (result.error) {
      throw new HttpException(
        result.error.message || 'Failed to fetch pilgrims',
        result.error.code || 500,
      );
    }
    return {
      message: 'Success fetch pilgrims',
      data: result.data,
    };
  }

  @Post()
  async createPilgrim(@UserContext() ctx: IUserContext, @Body() dto: CreatePilgrimDto) {
    const result = await this.usecase.createPilgrim(dto, ctx.id, ctx.agencySlug || '');
    if (result.error) {
      throw new HttpException(
        result.error.message || 'Failed to create pilgrim',
        result.error.code || 500,
      );
    }
    return {
      message: 'Pilgrim created successfully',
      data: result.data,
    };
  }

  @Get(':id')
  async getPilgrimDetail(@UserContext() ctx: IUserContext, @Param('id') id: string) {
    const result = await this.usecase.getPilgrimDetail(id, ctx.id);
    if (result.error) {
      throw new HttpException(
        result.error.message || 'Failed to fetch pilgrim detail',
        result.error.code || 500,
      );
    }
    return {
      message: 'Success fetch pilgrim detail',
      data: result.data,
    };
  }

  @Put(':id')
  async updatePilgrim(
    @UserContext() ctx: IUserContext,
    @Param('id') id: string,
    @Body() dto: UpdatePilgrimDto,
  ) {
    const result = await this.usecase.updatePilgrim(id, dto, ctx.id);
    if (result.error) {
      throw new HttpException(
        result.error.message || 'Failed to update pilgrim',
        result.error.code || 500,
      );
    }
    return {
      message: 'Pilgrim updated successfully',
      data: result.data,
    };
  }
}
