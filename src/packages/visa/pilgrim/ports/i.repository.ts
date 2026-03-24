import { Pilgrim } from '@prisma/client';

export interface IUserContext {
  id: string;
  role: string;
  agencySlug: string;
}

export interface IPilgrimRepository {
  findAll: (ctx: IUserContext, skip?: number, take?: number) => Promise<{ count: number; rows: Pilgrim[] }>;
  findById: (id: string, ctx: IUserContext) => Promise<Pilgrim | null>;
  create: (data: any) => Promise<Pilgrim>;
  update: (id: string, data: any, ctx: IUserContext) => Promise<Pilgrim>;
  delete: (id: string, ctx: IUserContext) => Promise<Pilgrim>;
}
