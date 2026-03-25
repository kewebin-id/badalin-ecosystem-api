export interface IUploadRepository {
  upload(file: string, bucket?: string, fileName?: string): Promise<string>;
}
