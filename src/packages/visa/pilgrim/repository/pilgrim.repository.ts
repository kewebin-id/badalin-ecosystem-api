import { clientDb } from '@/shared/utils/db';
import { Pilgrim, UserRole } from '@prisma/client';
import { IPilgrimRepository, IUserContext } from '../ports/i.repository';

export class PrismaPilgrimRepository implements IPilgrimRepository {
  private readonly db = clientDb;

  private getQueryFilter(ctx: IUserContext) {
    if (ctx.role === UserRole.SUPERADMIN) return {};
    if (ctx.role === UserRole.PROVIDER) return { agencySlug: ctx.agencySlug };
    return { leaderId: ctx.id, agencySlug: ctx.agencySlug };
  }

  findAll = async (ctx: IUserContext): Promise<Pilgrim[]> => {
    return this.db.pilgrim.findMany({
      where: { ...this.getQueryFilter(ctx) },
    });
  };

  findById = async (id: string, ctx: IUserContext): Promise<Pilgrim | null> => {
    return this.db.pilgrim.findFirst({
      where: { id, ...this.getQueryFilter(ctx) },
    });
  };

  create = async (data: any): Promise<Pilgrim> => {
    return this.db.pilgrim.create({ data });
  };

  update = async (id: string, data: any, ctx: IUserContext): Promise<Pilgrim> => {
    const filter = this.getQueryFilter(ctx);
    const exists = await this.findById(id, ctx);
    if (!exists) throw new Error('Pilgrim not found or access denied');

    return this.db.pilgrim.update({
      where: { id },
      data,
    });
  };

  delete = async (id: string, ctx: IUserContext): Promise<Pilgrim> => {
    const exists = await this.findById(id, ctx);
    if (!exists) throw new Error('Pilgrim not found or access denied');

    return this.db.pilgrim.delete({
      where: { id },
    });
  };
}
