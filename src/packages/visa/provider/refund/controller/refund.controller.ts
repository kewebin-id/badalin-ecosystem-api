import { EVisaRoutes } from '@/shared/constants';
import { UserContext } from '@/shared/decorators/user-context.decorator';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { ReservedWordGuard } from '@/shared/guards/reserved-word.guard';
import { SlugGuard } from '@/shared/guards/slug.guard';
import { IUserContext } from '@/shared/utils/rest-api/types';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SettleRefundDto } from '../dto/refund.dto';
import { IRefundUseCase } from '../ports/refund.usecase.port';

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
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const result = await this.useCase.getRefundList(ctx, page, limit, search);

    if (result.error) {
      throw new HttpException(
        result.error.message || 'Failed to fetch refund list',
        result.error.code || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      code: HttpStatus.OK,
      message: 'Refund list fetched successfully',
      data: result.data,
    };
  }

  @Post(':id/settle')
  async settleRefund(@Param('id') id: string, @Body() dto: SettleRefundDto, @UserContext() ctx: IUserContext) {
    const result = await this.useCase.settleRefund(id, dto.file, ctx);

    if (result.error) {
      throw new HttpException(
        result.error.message || 'Failed to settle refund',
        result.error.code || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      code: HttpStatus.OK,
      message: 'Success!',
      data: result.data,
    };
  }
}
