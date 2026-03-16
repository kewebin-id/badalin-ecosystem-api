import { Pilgrim } from '@prisma/client';

export interface IPilgrimRepository {
  findAll: (leaderId: string, agencySlug: string) => Promise<Pilgrim[]>;
  findById: (id: string, leaderId: string, agencySlug: string) => Promise<Pilgrim | null>;
  create: (data: any) => Promise<Pilgrim>;
  update: (id: string, data: any) => Promise<Pilgrim>;
}
