import { Agency } from '@prisma/client';

export interface IAgencyRepository {
  findById: (id: string) => Promise<Agency | null>;
  findBySlug: (slug: string) => Promise<Agency | null>;
  update: (id: string, data: Partial<Agency>, oldSlug?: string) => Promise<Agency>;
}
