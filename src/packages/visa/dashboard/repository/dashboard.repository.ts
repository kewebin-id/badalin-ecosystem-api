import { Injectable } from '@nestjs/common';
import { VisaSubmission } from '@prisma/client';
import { IDashboardRepository } from '../ports/i.repository';
import { clientDb } from '@/shared/utils';
import { globalLogger as Logger } from '@/shared/utils';

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  private readonly db = clientDb;

  findHistoryByLeaderAndAgency = async (leaderId: string, agencyId: string): Promise<VisaSubmission[]> => {
    try {
      // First, get the agency slug from ID if needed, 
      // but the BRD says agency_id from HttpOnly cookie.
      // Wait, in schema, VisaSubmission uses agencySlug. 
      // Let's find the agency first to get the slug.
      
      const agency = await this.db.agency.findUnique({
        where: { id: agencyId }
      });

      if (!agency) {
        return [];
      }

      return await this.db.visaSubmission.findMany({
        where: {
          leaderId: leaderId,
          agencySlug: agency.slug,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      Logger.error('Error in findHistoryByLeaderAndAgency:', error);
      throw error;
    }
  };
}
