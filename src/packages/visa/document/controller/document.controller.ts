import { Controller, Get, Param, Res, UseGuards, HttpStatus, Logger, Inject } from '@nestjs/common';
import { response } from '@/shared/utils/rest-api/response';
import { Response } from 'express';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { EDocumentRoutes, EVisaRoutes } from '@/shared/constants';
import { IDocumentUseCase } from '../ports/i.usecase';

@Controller(EVisaRoutes.DOCUMENTS)
@UseGuards(JwtAuthGuard)
export class DocumentController {
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
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error downloading visa');
      
      const status = (error as any).status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Failed to process document download';

      return response[status](res, { message });
    }
  }
}
