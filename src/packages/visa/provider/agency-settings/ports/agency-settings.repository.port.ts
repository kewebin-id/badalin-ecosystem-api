import { Agency } from '@prisma/client';

export interface IAgencySettingsRepository {
  findById(id: string): Promise<Agency | null>;
  findBySlug(slug: string): Promise<Agency | null>;
  create(data: Partial<Agency>): Promise<Agency>;
  update(id: string, data: Partial<Agency>, oldSlug?: string): Promise<Agency>;
}
