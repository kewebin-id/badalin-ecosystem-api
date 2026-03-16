import { Pilgrim } from '@prisma/client';
import { CreatePilgrimDto, UpdatePilgrimDto } from '../dto/pilgrim.dto';

export interface IPilgrimUseCase {
  findAll: (leaderId: string, agencySlug: string) => Promise<Pilgrim[]>;
  create: (leaderId: string, agencySlug: string, dto: CreatePilgrimDto) => Promise<Pilgrim>;
  update: (id: string, leaderId: string, agencySlug: string, dto: UpdatePilgrimDto) => Promise<Pilgrim>;
}
