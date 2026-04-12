import { EDocumentRoutes, EVisaRoutes } from '@/shared/constants';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { response } from '@/shared/utils/rest-api/response';
import { Controller, Get, HttpStatus, Inject, Logger, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { IDocumentUseCase } from '../ports/document.usecase.port';

@Controller(EVisaRoutes.PILGRIM_DOCUMENT)
@UseGuards(JwtAuthGuard)
export class PilgrimDocumentController {
  constructor(
    @Inject('IDocumentUseCase')
    private readonly documentUseCase: IDocumentUseCase,
  ) {}

  @Get(EDocumentRoutes.DOWNLOAD_VISA)
  async downloadVisa(@Param('transactionId') transactionId: string, @Res() res: Response): Promise<Response> {
    try {
      const result = await this.documentUseCase.getDownloadUrl(transactionId);

      return response[HttpStatus.OK](res, {
        message: 'Visa document is ready for download',
        data: result,
      });
    } catch (error: any) {
      Logger.error(error instanceof Error ? error.message : 'Error downloading visa');

      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error?.message || 'Failed to process document download';

      return response[status](res, { message });
    }
  }
}
