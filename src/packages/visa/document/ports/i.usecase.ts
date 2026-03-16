export interface IDocumentUseCase {
  getDownloadUrl: (transactionId: string) => Promise<{ downloadUrl: string }>;
}
