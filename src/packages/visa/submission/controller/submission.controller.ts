import { EServiceRoutes, ESubmissionRoutes, validationMessage } from '@/shared/constants';
import { response } from '@/shared/utils/rest-api/response';
import { Body, Controller, HttpStatus, Inject, Logger, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { CreateVisaSubmissionDto } from '../dto/submission.dto';
import { VisaSubmissionControllerPort } from '../ports/i.controller';
import { IVisaSubmissionUseCase } from '../ports/i.usecase';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { UserContext } from '@/shared/decorators/user-context.decorator';
import { IUserContext } from '@/shared/utils/rest-api/types';

@Controller(EServiceRoutes.VISA)
@UseGuards(JwtAuthGuard)
export class VisaSubmissionController implements VisaSubmissionControllerPort {
  constructor(
    @Inject('IVisaSubmissionUseCase')
    private readonly submitVisaUseCase: IVisaSubmissionUseCase,
  ) {}

  @Post(ESubmissionRoutes.SUBMIT)
  async create(
    @Body() dto: CreateVisaSubmissionDto,
    @UserContext() ctx: IUserContext,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const result = await this.submitVisaUseCase.create(ctx, dto);

      if (result?.error) {
        return response[HttpStatus.BAD_REQUEST](res, {
          message: result.error.message || validationMessage()[500](),
        });
      }

      return response[HttpStatus.CREATED](res, {
        message: validationMessage('Visa Submission')[201](),
        data: result.data,
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error in submit');
      return response[HttpStatus.INTERNAL_SERVER_ERROR](res, {
        message: error instanceof Error ? error.message : 'Failed to submit visa',
      });
    }
  }
}
