import { Body, Controller, Get, HttpStatus, Inject, Param, Post, Put, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { CreatePilgrimDto, UpdatePilgrimDto } from '../dto/pilgrim.dto';
import { IPilgrimUseCase } from '../ports/i.usecase';
import { EVisaRoutes, validationMessage } from '@/shared/constants';
import { response } from '@/shared/utils/rest-api/response';

@Controller(EVisaRoutes.PILGRIMS)
@UseGuards(JwtAuthGuard)
export class PilgrimController {
  constructor(
    @Inject('IPilgrimUseCase')
    private readonly pilgrimUseCase: IPilgrimUseCase,
  ) {}

  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req['user'];
      const agencySlug = req.cookies?.['agency_id'];
      const pilgrims = await this.pilgrimUseCase.findAll(user.id, agencySlug);
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
  async create(@Body() dto: CreatePilgrimDto, @Req() req: Request, @Res() res: Response) {
    try {
      const user = req['user'];
      const agencySlug = req.cookies?.['agency_id'];
      const pilgrim = await this.pilgrimUseCase.create(user.id, agencySlug, dto);
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
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = req['user'];
      const agencySlug = req.cookies?.['agency_id'];
      const pilgrim = await this.pilgrimUseCase.update(id, user.id, agencySlug, dto);
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
}
