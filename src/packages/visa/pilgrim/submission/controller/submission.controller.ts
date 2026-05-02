import { Body, Controller, Get, HttpException, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { EVisaRoutes } from '@/shared/constants';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserContext } from '@/shared/decorators/user-context.decorator';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { IPilgrimSubmissionUseCase } from '../ports/submission.usecase.port';

@Controller(EVisaRoutes.PILGRIM_SUBMISSION)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PILGRIM)
export class PilgrimSubmissionController {
  constructor(
    @Inject('IPilgrimSubmissionUseCase')
    private readonly usecase: IPilgrimSubmissionUseCase,
  ) {}

  @Get('submissions')
  async getMySubmissions(@UserContext() ctx: IUserContext) {
    try {
      const result = await this.usecase.getMySubmissions(ctx);
      return {
        message: 'Success fetch submissions',
        data: result.data,
        total: result.total,
      };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Internal server error',
        500,
      );
    }
  }

  @Post('submissions')
  async submit(@UserContext() ctx: IUserContext, @Body() data: any) {
    try {
      const result = await this.usecase.submit(data, ctx);
      return {
        message: 'Submission created successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Internal server error',
        error instanceof HttpException ? error.getStatus() : 500,
      );
    }
  }
  
  @Post('submissions/preview')
  async preview(@UserContext() ctx: IUserContext, @Body() data: any) {
    try {
      const result = await this.usecase.preview(data, ctx);
      return {
        message: 'Success preview submission',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Internal server error',
        error instanceof HttpException ? error.getStatus() : 500,
      );
    }
  }

  @Get('submissions/:id')
  async getDetail(@UserContext() ctx: IUserContext, @Param('id') id: string) {
    try {
      const result = await this.usecase.getDetail(id, ctx);
      return {
        message: 'Success fetch submission detail',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Internal server error',
        error instanceof HttpException ? error.getStatus() : 500,
      );
    }
  }
}
