import { Injectable } from '@nestjs/common';
import { IUploadRepository } from '../ports/i.repository';
import { uploadFile } from '@/shared/utils/upload.util';

@Injectable()
export class PrismaUploadRepository implements IUploadRepository {
  async upload(file: string, bucket?: string, fileName?: string): Promise<string> {
    return uploadFile(file, bucket, fileName);
  }
}
