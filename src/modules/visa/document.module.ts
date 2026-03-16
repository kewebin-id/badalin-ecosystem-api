import { DocumentController } from '@/packages/visa/document/controller/document.controller';
import { PrismaDocumentRepository } from '@/packages/visa/document/repository/document.repository';
import { DocumentUseCase } from '@/packages/visa/document/usecase/document.usecase';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DocumentController],
  providers: [
    {
      provide: 'IDocumentUseCase',
      useClass: DocumentUseCase,
    },
    {
      provide: 'IDocumentRepository',
      useClass: PrismaDocumentRepository,
    },
  ],
  exports: ['IDocumentUseCase'],
})
export class DocumentModule {}
