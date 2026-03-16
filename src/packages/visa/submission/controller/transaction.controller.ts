import { ESubmissionRoutes, EVisaRoutes, validationMessage } from '@/shared/constants';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { response } from '@/shared/utils/rest-api/response';
import { Body, Controller, HttpStatus, Inject, Logger, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { Request, Response } from 'express';
import { SubmitVisaDto } from '../dto/submission.dto';
import { IVisaSubmissionRepository, IVisaSubmissionUseCase } from '../ports';

import { VisaSubmissionTransactionControllerPort } from '../ports/i.controller';

@Controller(EVisaRoutes.TRANSACTIONS)
@UseGuards(JwtAuthGuard)
export class TransactionController implements VisaSubmissionTransactionControllerPort {
  constructor(
    @Inject('IVisaSubmissionUseCase')
    private readonly submitVisaUseCase: IVisaSubmissionUseCase,
    @Inject('IVisaSubmissionRepository')
    private readonly repository: IVisaSubmissionRepository,
  ) {}

  @Post()
  async create(@Body() dto: SubmitVisaDto, @Req() req: Request, @Res() res: Response): Promise<Response> {
    try {
      const user = req['user'];
      const result = await this.submitVisaUseCase.create(dto, user.id, user.id);
      return response[HttpStatus.CREATED](res, {
        message: validationMessage('Transaction')[201](),
        data: result.data,
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error in create transaction');
      return response[HttpStatus.INTERNAL_SERVER_ERROR](res, {
        message: error instanceof Error ? error.message : 'Failed to create transaction',
      });
    }
  }

  @Post(ESubmissionRoutes.UPLOAD_PROOF)
  async uploadProof(
    @Param('id') id: string,
    @Body('proofUrl') proofUrl: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.repository.updatePaymentStatus(id, PaymentStatus.CHECKING, proofUrl);
      return response[HttpStatus.OK](res, {
        message: 'Proof uploaded successfully',
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error uploading proof');
      return response[HttpStatus.INTERNAL_SERVER_ERROR](res, {
        message: 'Failed to upload proof',
      });
    }
  }
}
