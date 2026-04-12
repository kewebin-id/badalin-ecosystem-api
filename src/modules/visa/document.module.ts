import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PilgrimDocumentController, PilgrimDocumentUseCase, PilgrimDocumentRepository } from '@/packages/visa/pilgrim/document';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [PilgrimDocumentController],
  providers: [
    {
      provide: 'IDocumentRepository',
      useClass: PilgrimDocumentRepository,
    },
    {
      provide: 'IDocumentUseCase',
      useClass: PilgrimDocumentUseCase,
    },
  ],
})
export class DocumentModule {}
