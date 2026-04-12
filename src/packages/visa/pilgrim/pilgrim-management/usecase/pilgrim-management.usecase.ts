import { IUsecaseResponse } from '@/shared/utils';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Pilgrim } from '@prisma/client';
import { CreatePilgrimDto, UpdatePilgrimDto } from '../dto/pilgrim-management.dto';
import { IPilgrimManagementRepository } from '../ports/pilgrim-management.repository.port';
import { IPilgrimManagementUseCase } from '../ports/pilgrim-management.usecase.port';

@Injectable()
export class PilgrimManagementUseCase implements IPilgrimManagementUseCase {
  constructor(
    @Inject('IPilgrimManagementRepository')
    private readonly repository: IPilgrimManagementRepository,
  ) {}

  getPilgrims = async (
    leaderId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<IUsecaseResponse<{ items: Pilgrim[]; totalItems: number; totalPages: number; currentPage: number }>> => {
    try {
      const { items, total } = await this.repository.findAllByLeaderId(leaderId, page, limit, search);
      return {
        data: {
          items,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch pilgrims',
          code: error instanceof HttpException ? error.getStatus() : 500,
        },
      };
    }
  };

  getPilgrimDetail = async (id: string, leaderId: string): Promise<IUsecaseResponse<Pilgrim>> => {
    try {
      const pilgrim = await this.repository.findById(id);
      if (!pilgrim || pilgrim.leaderId !== leaderId) {
        throw new HttpException('Pilgrim not found', HttpStatus.NOT_FOUND);
      }
      return { data: pilgrim };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch pilgrim detail',
          code: error instanceof HttpException ? error.getStatus() : 500,
        },
      };
    }
  };

  createPilgrim = async (
    data: CreatePilgrimDto,
    leaderId: string,
    agencySlug: string,
  ): Promise<IUsecaseResponse<Pilgrim>> => {
    try {
      const existing = await this.repository.findByPassport(data.passportNumber);
      if (existing) {
        throw new HttpException('A pilgrim with this passport number already exists', HttpStatus.CONFLICT);
      }

      const pilgrim = await this.repository.create(data, leaderId, agencySlug, leaderId);
      return { data: pilgrim };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Failed to create pilgrim',
          code: error instanceof HttpException ? error.getStatus() : 500,
        },
      };
    }
  };

  updatePilgrim = async (
    id: string,
    data: UpdatePilgrimDto,
    leaderId: string,
  ): Promise<IUsecaseResponse<Pilgrim>> => {
    try {
      const pilgrim = await this.repository.findById(id);
      if (!pilgrim || pilgrim.leaderId !== leaderId) {
        throw new HttpException('Pilgrim not found', HttpStatus.NOT_FOUND);
      }

      const updated = await this.repository.update(id, data, leaderId);
      return { data: updated };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Failed to update pilgrim',
          code: error instanceof HttpException ? error.getStatus() : 500,
        },
      };
    }
  };
}
