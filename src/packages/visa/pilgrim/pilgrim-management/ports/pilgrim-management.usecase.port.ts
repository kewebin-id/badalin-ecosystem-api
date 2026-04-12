import { IUsecaseResponse } from '@/shared/utils';
import { Pilgrim } from '@prisma/client';
import { CreatePilgrimDto, UpdatePilgrimDto } from '../dto/pilgrim-management.dto';

export interface IPilgrimManagementUseCase {
  getPilgrims: (leaderId: string, page: number, limit: number, search?: string) => Promise<IUsecaseResponse<{ 
    items: Pilgrim[]; 
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }>>;
  getPilgrimDetail: (id: string, leaderId: string) => Promise<IUsecaseResponse<Pilgrim>>;
  createPilgrim: (data: CreatePilgrimDto, leaderId: string, agencySlug: string) => Promise<IUsecaseResponse<Pilgrim>>;
  updatePilgrim: (id: string, data: UpdatePilgrimDto, leaderId: string) => Promise<IUsecaseResponse<Pilgrim>>;
}
