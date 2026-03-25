import { IUsecaseResponse } from '@/shared/utils/rest-api/types';
import { UploadDto, UploadResult } from '../domain/upload.entity';

export interface IUploadUseCase {
  execute(dto: UploadDto): Promise<IUsecaseResponse<UploadResult>>;
}
