import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Delete,
  Res,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { CreatePilgrimDto, UpdatePilgrimDto } from '../dto/pilgrim.dto';
import { IPilgrimUseCase } from '../ports/i.usecase';
import { EVisaRoutes, validationMessage } from '@/shared/constants';
import { response } from '@/shared/utils/rest-api/response';
import { UserContext } from '@/shared/decorators/user-context.decorator';
import { IUserContext } from '@/shared/utils/rest-api/types';

@Controller(EVisaRoutes.PILGRIMS)
@UseGuards(JwtAuthGuard)
export class PilgrimController {
  constructor(
    @Inject('IPilgrimUseCase')
    private readonly pilgrimUseCase: IPilgrimUseCase,
  ) {}

  @Get()
  async findAll(@UserContext() ctx: IUserContext, @Res() res: Response) {
    try {
      const pilgrims = await this.pilgrimUseCase.findAll(ctx);
      return response[HttpStatus.OK](res, {
        message: 'Success fetch pilgrims',
        data: pilgrims,
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error fetching pilgrims');
      return response[HttpStatus.INTERNAL_SERVER_ERROR](res, {
        message: 'Failed to fetch pilgrims',
      });
    }
  }

  @Post()
  async create(@Body() dto: CreatePilgrimDto, @UserContext() ctx: IUserContext, @Res() res: Response) {
    try {
      const pilgrim = await this.pilgrimUseCase.create(ctx, dto);
      return response[HttpStatus.CREATED](res, {
        message: validationMessage('Pilgrim')[201](),
        data: pilgrim,
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error creating pilgrim');
      return response[HttpStatus.INTERNAL_SERVER_ERROR](res, {
        message: error instanceof Error ? error.message : 'Failed to create pilgrim',
      });
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePilgrimDto,
    @UserContext() ctx: IUserContext,
    @Res() res: Response,
  ) {
    try {
      const pilgrim = await this.pilgrimUseCase.update(id, ctx, dto);
      return response[HttpStatus.OK](res, {
        message: 'Pilgrim updated successfully',
        data: pilgrim,
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error updating pilgrim');
      return response[HttpStatus.INTERNAL_SERVER_ERROR](res, {
        message: error instanceof Error ? error.message : 'Failed to update pilgrim',
      });
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @UserContext() ctx: IUserContext, @Res() res: Response) {
    try {
      await this.pilgrimUseCase.delete(id, ctx);
      return response[HttpStatus.OK](res, {
        message: 'Pilgrim deleted successfully',
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error deleting pilgrim');
      return response[HttpStatus.INTERNAL_SERVER_ERROR](res, {
        message: error instanceof Error ? error.message : 'Failed to delete pilgrim',
      });
    }
  }
}
