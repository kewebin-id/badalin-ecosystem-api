import { Controller, Get, Patch, Body, Inject, UseGuards, Param, Query, HttpStatus } from '@nestjs/common';
import { EActorPrefix } from '@/shared/constants';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { SlugGuard } from '@/shared/guards/slug.guard';
import { ReservedWordGuard } from '@/shared/guards/reserved-word.guard';
import { UserContext } from '@/shared/decorators/user-context.decorator';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { IVerificationUseCase } from '../ports/verification.usecase.port';
import { ReviewSubmissionDto } from '../dto/verification.dto';

@Controller(EActorPrefix.PROVIDER)
@UseGuards(JwtAuthGuard, SlugGuard, ReservedWordGuard)
export class VerificationController {
  constructor(
    @Inject('IVerificationUseCase')
    private readonly useCase: IVerificationUseCase,
  ) {}

  @Get('submissions')
  async listSubmissions(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @UserContext() ctx: IUserContext,
  ) {
    const result = await this.useCase.findAll({ page: Number(page), limit: Number(limit), search }, ctx);
    return {
      code: HttpStatus.OK,
      message: 'Submissions retrieved successfully',
      data: result,
    };
  }

  @Patch('submissions/:id/verify-payment')
  async verifyPayment(@Param('id') id: string, @UserContext() ctx: IUserContext) {
    const result = await this.useCase.verifyPayment(id, ctx);
    return {
      code: HttpStatus.OK,
      message: 'Payment verified successfully and document is now in review',
      data: result,
    };
  }

  @Patch('submissions/:id/review')
  async review(@Param('id') id: string, @Body() dto: ReviewSubmissionDto, @UserContext() ctx: IUserContext) {
    const result = await this.useCase.review(id, dto, ctx);
    return {
      code: HttpStatus.OK,
      message: `Submission ${dto.status.toLowerCase()} successfully`,
      data: result,
    };
  }

  @Get('submissions/:id')
  async getDetail(@Param('id') id: string, @UserContext() ctx: IUserContext) {
    const result = await this.useCase.findOne(id, ctx);
    return {
      code: HttpStatus.OK,
      message: 'Submission retrieved successfully',
      data: result,
    };
  }
}
