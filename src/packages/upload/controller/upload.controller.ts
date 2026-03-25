import { Body, Controller, HttpStatus, Inject, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { IUploadUseCase } from '../ports/i.usecase';
import { UploadDto } from '../domain/upload.entity';
import { response } from '@/shared/utils/rest-api/response';
import { EVisaRoutes } from '@/shared/constants';

@Controller(EVisaRoutes.UPLOAD)
export class UploadController {
  constructor(
    @Inject('IUploadUseCase')
    private readonly usecase: IUploadUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async upload(@Body() dto: UploadDto, @Res() res: Response) {
    if (!dto.file) {
      return response[HttpStatus.BAD_REQUEST](res, {
        message: 'File content (base64) is required',
      });
    }

    const { data, error } = await this.usecase.execute(dto);

    if (error) {
      return response[error.code || HttpStatus.INTERNAL_SERVER_ERROR](res, {
        message: error.message,
      });
    }

    return response[HttpStatus.OK](res, {
      message: 'File uploaded successfully',
      data,
    });
  }
}
