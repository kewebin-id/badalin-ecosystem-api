import { Controller, Get, Patch, Body, Inject, UseGuards, Param, Query } from '@nestjs/common';
import { EVisaRoutes, ESubmissionRoutes } from '@/shared/constants';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { SlugGuard } from '@/shared/guards/slug.guard';
import { ReservedWordGuard } from '@/shared/guards/reserved-word.guard';
import { UserContext } from '@/shared/decorators/user-context.decorator';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { response } from '@/shared/utils/rest-api/response';
import { IVerificationUseCase } from '../ports/verification.usecase.port';
import { ReviewSubmissionDto } from '../dto/verification.dto';

@Controller(EVisaRoutes.PROVIDER_VERIFICATION)
@UseGuards(JwtAuthGuard, SlugGuard, ReservedWordGuard)
export class VerificationController {
  constructor(
    @Inject('IVerificationUseCase')
    private readonly useCase: IVerificationUseCase,
  ) {}

  @Get()
  async listSubmissions(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @UserContext() ctx: IUserContext,
  ) {
    return this.useCase.findAll({ page: Number(page), limit: Number(limit), search }, ctx);
  }

  @Patch(ESubmissionRoutes.VERIFY_PAYMENT)
  async verifyPayment(@Param('id') id: string, @UserContext() ctx: IUserContext) {
    return this.useCase.verifyPayment(id, ctx);
  }

  @Patch(ESubmissionRoutes.REVIEW)
  async review(@Param('id') id: string, @Body() dto: ReviewSubmissionDto, @UserContext() ctx: IUserContext) {
    return this.useCase.review(id, dto, ctx);
  }
}
