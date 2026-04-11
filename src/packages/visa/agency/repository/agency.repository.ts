import { clientDb } from '@/shared/utils/db';
import { Injectable } from '@nestjs/common';
import { Agency } from '@prisma/client';
import { IAgencyRepository } from '../ports/i.repository';

@Injectable()
export class PrismaAgencyRepository implements IAgencyRepository {
  private readonly prisma = clientDb;

  async findById(id: string): Promise<Agency | null> {
    return this.prisma.agency.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<Agency | null> {
    return this.prisma.agency.findUnique({
      where: { slug },
    });
  }

  async update(id: string, data: Partial<Agency>, oldSlug?: string): Promise<Agency> {
    const { slug, ...otherData } = data;

    if (!slug || slug === oldSlug) {
      return this.prisma.agency.update({
        where: { id },
        data: otherData,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedAgency = await tx.agency.update({
        where: { id },
        data: {
          ...otherData,
          slug,
          lastSlugUpdate: new Date(),
        },
      });

      if (oldSlug) {
        await tx.user.updateMany({
          where: { agencySlug: oldSlug },
          data: { agencySlug: slug },
        });

        await tx.pilgrim.updateMany({
          where: { agencySlug: oldSlug },
          data: { agencySlug: slug },
        });

        await tx.visaSubmission.updateMany({
          where: { agencySlug: oldSlug },
          data: { agencySlug: slug },
        });
      }

      return updatedAgency;
    });
  }
}
