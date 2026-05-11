import { Body, Controller, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { IRefundUseCase } from '../ports/refund.usecase.port';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { UserContext } from '@/shared/decorators/user-context.decorator';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { SettleRefundDto } from '../dto/refund.dto';

@Controller('provider/refund')
@UseGuards(JwtAuthGuard)
export class RefundController {
  constructor(
    @Inject('IRefundUseCase')
    private readonly useCase: IRefundUseCase,
  ) {}

  @Get()
  async getRefundList(@UserContext() ctx: IUserContext) {
    return this.useCase.getRefundList(ctx);
  }

  @Post(':id/settle')
  async settleRefund(
    @Param('id') id: string,
    @Body() dto: SettleRefundDto,
    @UserContext() ctx: IUserContext,
  ) {
    return this.useCase.settleRefund(id, dto.file, ctx);
  }
}
