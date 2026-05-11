import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { IRefundUseCase } from '../ports/refund.usecase.port';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { UserContext } from '@/shared/decorators/user-context.decorator';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { SettleRefundDto } from '../dto/refund.dto';
import { EVisaRoutes } from '@/shared/constants';
import { SlugGuard } from '@/shared/guards/slug.guard';
import { ReservedWordGuard } from '@/shared/guards/reserved-word.guard';
import { response } from '@/shared/utils/rest-api/response';
import { Response } from 'express';

@Controller(EVisaRoutes.PROVIDER_REFUND)
@UseGuards(JwtAuthGuard, SlugGuard, ReservedWordGuard)
export class RefundController {
  constructor(
    @Inject('IRefundUseCase')
    private readonly useCase: IRefundUseCase,
  ) {}

  @Get()
  async getRefundList(
    @UserContext() ctx: IUserContext,
    @Res() res: Response,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const result = await this.useCase.getRefundList(ctx, page, limit, search);

    if (result.error) {
      return response[result.error.code || HttpStatus.INTERNAL_SERVER_ERROR](res, {
        message: result.error.message,
      });
    }

    return response[HttpStatus.OK](res, {
      message: 'Refund list fetched successfully',
      data: result.data,
    });
  }

  @Post(':id/settle')
  async settleRefund(
    @Param('id') id: string,
    @Body() dto: SettleRefundDto,
    @UserContext() ctx: IUserContext,
    @Res() res: Response,
  ) {
    const result = await this.useCase.settleRefund(id, dto.file, ctx);

    if (result.error) {
      return response[result.error.code || HttpStatus.INTERNAL_SERVER_ERROR](res, {
        message: result.error.message,
      });
    }

    return response[HttpStatus.OK](res, {
      message: 'Refund settled successfully',
      data: result.data,
    });
  }
}
