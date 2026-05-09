import { clientDb } from '@/shared/utils/db';
import { Injectable } from '@nestjs/common';
import { Agency, Prisma } from '@prisma/client';
import { IAgencySettingsRepository } from '../ports/agency-settings.repository.port';

@Injectable()
export class AgencySettingsRepository implements IAgencySettingsRepository {
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

  async create(data: Partial<Agency>): Promise<Agency> {
    return this.prisma.agency.create({
      data: {
        name: data.name || 'New Agency',
        slug: data.slug!,
        visaPrice: data.visaPrice || 0,
        isActive: true,
        createdBy: data.createdBy,
      },
    });
  }

  async update(id: string, data: Prisma.AgencyUpdateInput, oldSlug?: string): Promise<Agency> {
    const { slug, ...otherData } = data;
    const slugValue = typeof slug === 'string' ? slug : undefined;

    if (!slugValue || slugValue === oldSlug) {
      return this.prisma.agency.update({
        where: { id },
        data: otherData as Prisma.AgencyUpdateInput,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedAgency = await tx.agency.update({
        where: { id },
        data: {
          ...otherData,
          slug: slugValue,
          lastSlugUpdate: new Date(),
        },
      });

      if (oldSlug) {
        await tx.user.updateMany({
          where: { agencySlug: oldSlug },
          data: { agencySlug: slugValue },
        });

        await tx.pilgrim.updateMany({
          where: { agencySlug: oldSlug },
          data: { agencySlug: slugValue },
        });

        await tx.visaSubmission.updateMany({
          where: { agencySlug: oldSlug },
          data: { agencySlug: slugValue },
        });
      }

      return updatedAgency;
    });
  }
}
