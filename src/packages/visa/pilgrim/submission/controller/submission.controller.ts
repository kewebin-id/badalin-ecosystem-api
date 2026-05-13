import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { EVisaRoutes, ESubmissionRoutes } from '@/shared/constants';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserContext } from '@/shared/decorators/user-context.decorator';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { IPilgrimSubmissionUseCase, ISubmissionRequest } from '../ports/submission.usecase.port';

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
        code: HttpStatus.OK,
        message: 'Success fetch submissions',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error instanceof Error ? error.message : 'Internal server error', 500);
    }
  }

  @Post('submissions')
  @HttpCode(HttpStatus.CREATED)
  async submit(@UserContext() ctx: IUserContext, @Body() data: ISubmissionRequest) {
    try {
      const result = await this.usecase.submit(data, ctx);
      return {
        code: HttpStatus.CREATED,
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
  async preview(@UserContext() ctx: IUserContext, @Body() data: ISubmissionRequest) {
    try {
      const result = await this.usecase.preview(data, ctx);
      return {
        code: HttpStatus.OK,
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
        code: HttpStatus.OK,
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

  @Post(ESubmissionRoutes.UPLOAD_PROOF)
  async uploadProof(@UserContext() ctx: IUserContext, @Param('id') id: string, @Body('file') file: string) {
    try {
      const result = await this.usecase.uploadProof(id, file, ctx);
      return {
        code: HttpStatus.OK,
        message: 'Payment proof uploaded successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Internal server error',
        error instanceof HttpException ? error.getStatus() : 500,
      );
    }
  }

  @Put('submissions/:id')
  async update(@UserContext() ctx: IUserContext, @Param('id') id: string, @Body() data: ISubmissionRequest) {
    try {
      const result = await this.usecase.update(id, data, ctx);
      return {
        code: HttpStatus.OK,
        message: 'Submission updated successfully',
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
