import { ESubmissionRoutes, EVisaRoutes, validationMessage } from '@/shared/constants';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { response } from '@/shared/utils/rest-api/response';
import { Body, Controller, Get, HttpStatus, Inject, Logger, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { Response } from 'express';
import { CreateVisaSubmissionDto } from '../dto/submission.dto';
import { IVisaSubmissionRepository, IVisaSubmissionUseCase } from '../ports';
import { UserContext } from '@/shared/decorators/user-context.decorator';
import { IUserContext } from '@/shared/utils/rest-api/types';

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
 
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
    @UserContext() ctx: IUserContext,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const result = await this.submitVisaUseCase.getTransactions({ page, limit, search }, ctx);
      return response[HttpStatus.OK](res, {
        message: 'Transactions retrieved successfully',
        data: result.data,
        meta: {
          total: result.total,
          page: Number(page),
          limit: Number(limit),
        },
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error retrieving transactions');
      return response[HttpStatus.INTERNAL_SERVER_ERROR](res, {
        message: error instanceof Error ? error.message : 'Failed to retrieve transactions',
      });
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @UserContext() ctx: IUserContext,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const result = await this.submitVisaUseCase.getSubmission(id, ctx);
      if (!result) {
        return response[HttpStatus.NOT_FOUND](res, {
          message: 'Transaction not found',
        });
      }
      return response[HttpStatus.OK](res, {
        message: 'Transaction retrieved successfully',
        data: result,
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error retrieving transaction');
      return response[HttpStatus.INTERNAL_SERVER_ERROR](res, {
        message: error instanceof Error ? error.message : 'Failed to retrieve transaction',
      });
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: CreateVisaSubmissionDto,
    @UserContext() ctx: IUserContext,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const result = await this.submitVisaUseCase.update(id, ctx, dto);
      return response[HttpStatus.OK](res, {
        message: 'Transaction updated successfully',
        data: result.data,
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error in update transaction');
      return response[HttpStatus.INTERNAL_SERVER_ERROR](res, {
        message: error instanceof Error ? error.message : 'Failed to update transaction',
      });
    }
  }

  @Post()
  async create(
    @Body() dto: CreateVisaSubmissionDto,
    @UserContext() ctx: IUserContext,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const result = await this.submitVisaUseCase.create(ctx, dto);
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
    @UserContext() ctx: IUserContext,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.repository.updatePaymentStatus(id, PaymentStatus.CHECKING, ctx, proofUrl);
      return response[HttpStatus.OK](res, {
        message: 'Proof uploaded successfully',
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error uploading proof');
      return response[HttpStatus.INTERNAL_SERVER_ERROR](res, {
        message: error instanceof Error ? error.message : 'Failed to upload proof',
      });
    }
  }
}
