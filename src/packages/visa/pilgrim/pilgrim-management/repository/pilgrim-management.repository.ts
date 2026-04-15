import { clientDb as prisma } from '@/shared/utils/db';
import { Pilgrim, Prisma } from '@prisma/client';
import { CreatePilgrimDto, UpdatePilgrimDto } from '../dto/pilgrim-management.dto';
import { IPilgrimManagementRepository } from '../ports/pilgrim-management.repository.port';

export class PilgrimManagementRepository implements IPilgrimManagementRepository {
  private readonly db = prisma;

  findAllByLeaderId = async (
    leaderId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ items: Pilgrim[]; total: number }> => {
    const where: Prisma.PilgrimWhereInput = {
      leaderId,
      deletedAt: null,
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { passportNumber: { contains: search, mode: 'insensitive' } },
          { nik: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.db.pilgrim.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.pilgrim.count({ where }),
    ]);

    return { items, total };
  };

  findById = async (id: string): Promise<Pilgrim | null> => {
    return this.db.pilgrim.findFirst({
      where: { id, deletedAt: null },
    });
  };

  create = async (
    dto: CreatePilgrimDto,
    leaderId: string,
    agencySlug: string,
    createdBy: string,
  ): Promise<Pilgrim> => {
    const { ocrConfidence, ...rest } = dto;
    const isComplete = this.calculateCompletion(rest);

    return this.db.pilgrim.create({
      data: {
        ...rest,
        isComplete,
        leaderId,
        agencySlug,
        createdBy,
        updatedBy: createdBy,
      },
    });
  };

  update = async (id: string, dto: UpdatePilgrimDto, updatedBy: string): Promise<Pilgrim> => {
    const { ocrConfidence, ...rest } = dto;

    // Fetch current state to recalculate completion
    const existing = await this.db.pilgrim.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Pilgrim not found');
    }

    const mergedData = { ...existing, ...rest };
    const isComplete = this.calculateCompletion(mergedData);

    return this.db.pilgrim.update({
      where: { id },
      data: {
        ...rest,
        isComplete,
        updatedBy,
      },
    });
  };

  private calculateCompletion(data: any): boolean {
    const mandatoryFields = [
      'fullName',
      'passportNumber',
      'passportExpiry',
      'birthDate',
      'gender',
      'maritalStatus',
      'nik',
      'ktpUrl',
      'passportUrl',
    ];

    return mandatoryFields.every((field) => {
      const value = data[field];
      if (value === undefined || value === null) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      return true;
    });
  }

  delete = async (id: string): Promise<void> => {
    await this.db.pilgrim.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  };

  findByPassport = async (passportNumber: string): Promise<Pilgrim | null> => {
    return this.db.pilgrim.findFirst({
      where: { passportNumber, deletedAt: null },
    });
  };
}
