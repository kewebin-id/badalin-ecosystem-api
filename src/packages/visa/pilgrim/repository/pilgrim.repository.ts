import { clientDb } from '@/shared/utils/db';
import { Pilgrim } from '@prisma/client';
import { IPilgrimRepository } from '../ports/i.repository';

export class PrismaPilgrimRepository implements IPilgrimRepository {
  private readonly db = clientDb;

  findAll = async (leaderId: string, agencySlug: string): Promise<Pilgrim[]> => {
    return this.db.pilgrim.findMany({
      where: { leaderId, agencySlug },
    });
  };

  findById = async (id: string, leaderId: string, agencySlug: string): Promise<Pilgrim | null> => {
    return this.db.pilgrim.findFirst({
      where: { id, leaderId, agencySlug },
    });
  };

  create = async (data: any): Promise<Pilgrim> => {
    return this.db.pilgrim.create({ data });
  };

  update = async (id: string, data: any): Promise<Pilgrim> => {
    return this.db.pilgrim.update({
      where: { id },
      data,
    });
  };
}
