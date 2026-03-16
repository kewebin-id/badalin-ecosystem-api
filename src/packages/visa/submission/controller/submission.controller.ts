import { EServiceRoutes, ESubmissionRoutes, validationMessage } from '@/shared/constants';
import { response } from '@/shared/utils/rest-api/response';
import { Body, Controller, Headers, HttpStatus, Inject, Logger, Post, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { SubmitVisaDto } from '../dto/submission.dto';
import { VisaSubmissionControllerPort } from '../ports/i.controller';
import { IVisaSubmissionUseCase } from '../ports/i.usecase';

@Controller(EServiceRoutes.VISA)
export class VisaSubmissionController implements VisaSubmissionControllerPort {
  constructor(
    @Inject('IVisaSubmissionUseCase')
    private readonly submitVisaUseCase: IVisaSubmissionUseCase,
    private readonly jwtService: JwtService,
  ) {}

  @Post(ESubmissionRoutes.SUBMIT)
  async create(
    @Body() dto: SubmitVisaDto,
    @Headers('authorization') token: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const jwtToken = token?.replace('Bearer ', '');

      if (!jwtToken) {
        return response[HttpStatus.UNAUTHORIZED](res, { message: 'Token is required' });
      }

      const decoded = this.jwtService.verify(jwtToken);
      const requesterId = decoded.id;
      const leaderId = decoded.id;

      const result = await this.submitVisaUseCase.create(dto, requesterId, leaderId);

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
        message: 'Invalid or expired token',
      });
    }
  }
}
