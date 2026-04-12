import { Pilgrim } from '@prisma/client';
import { CreatePilgrimDto, UpdatePilgrimDto } from '../dto/pilgrim-management.dto';

export interface IPilgrimManagementRepository {
  findAllByLeaderId: (leaderId: string, page: number, limit: number, search?: string) => Promise<{ items: Pilgrim[]; total: number }>;
  findById: (id: string) => Promise<Pilgrim | null>;
  create: (data: CreatePilgrimDto, leaderId: string, agencySlug: string, createdBy: string) => Promise<Pilgrim>;
  update: (id: string, data: UpdatePilgrimDto, updatedBy: string) => Promise<Pilgrim>;
  delete: (id: string) => Promise<void>;
  findByPassport: (passportNumber: string) => Promise<Pilgrim | null>;
}
