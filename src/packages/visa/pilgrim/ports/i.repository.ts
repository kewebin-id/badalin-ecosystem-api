import { Pilgrim, Prisma } from '@prisma/client';

export interface IUserContext {
  id: string;
  role: string;
  agencySlug: string;
}

export interface IPilgrimRepository {
  findAll: (ctx: IUserContext, skip?: number, take?: number, search?: string) => Promise<{ count: number; rows: Pilgrim[] }>;
  findById: (id: string, ctx: IUserContext) => Promise<Pilgrim | null>;
  create: (data: Prisma.PilgrimUncheckedCreateInput) => Promise<Pilgrim>;
  update: (id: string, data: Prisma.PilgrimUncheckedUpdateInput, ctx: IUserContext) => Promise<Pilgrim>;
  delete: (id: string, ctx: IUserContext) => Promise<Pilgrim>;
}
