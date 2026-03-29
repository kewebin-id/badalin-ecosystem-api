import { Pilgrim } from '@prisma/client';
import { CreatePilgrimDto, UpdatePilgrimDto } from '../dto/pilgrim.dto';
import { IUserContext } from './i.repository';
import { PaginationDto } from '@/shared/utils/rest-api/pagination';
import { IPaginationResponse } from '@/shared/utils/rest-api/types';

export interface IPilgrimUseCase {
  findAll: (ctx: IUserContext, paginationDto: PaginationDto) => Promise<IPaginationResponse<Pilgrim>>;
  create: (ctx: IUserContext, dto: CreatePilgrimDto) => Promise<{ data: Pilgrim; message?: string }>;
  findById: (id: string, ctx: IUserContext) => Promise<Pilgrim | null>;
  update: (id: string, ctx: IUserContext, dto: UpdatePilgrimDto) => Promise<{ data: Pilgrim; message?: string }>;
  delete: (id: string, ctx: IUserContext) => Promise<Pilgrim>;
}
