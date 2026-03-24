import { Pilgrim } from '@prisma/client';
import { CreatePilgrimDto, UpdatePilgrimDto } from '../dto/pilgrim.dto';
import { IUserContext } from './i.repository';

export interface IPilgrimUseCase {
  findAll: (ctx: IUserContext) => Promise<Pilgrim[]>;
  create: (ctx: IUserContext, dto: CreatePilgrimDto) => Promise<Pilgrim>;
  update: (id: string, ctx: IUserContext, dto: UpdatePilgrimDto) => Promise<Pilgrim>;
  delete: (id: string, ctx: IUserContext) => Promise<Pilgrim>;
}
