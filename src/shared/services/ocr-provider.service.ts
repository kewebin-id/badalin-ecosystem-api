import { clientDb } from '@/shared/utils/db';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

export interface IActiveOcrProvider {
  keyFilename: string;
  projectId: string;
  providerId: string;
}

@Injectable()
export class OcrProviderService {
  private readonly db = clientDb;

  /**
   * Get an active OCR provider based on the "Waterfall" rule:
   * 1. Sorted by sequence (1, 2, 3, etc.)
   * 2. Usage count < 1000 for the current month/year
   * 3. Fallback to the provider with the highest sequence if all are over 1000
   */
  getActiveProvider = async (): Promise<IActiveOcrProvider> => {
    const now = dayjs();
    const month = now.month() + 1;
    const year = now.year();

    const providers = await this.db.ocrProvider.findMany({
      where: { isActive: true },
      orderBy: { sequence: 'asc' },
    });

    if (providers.length === 0) {
      throw new Error('No active OCR providers found in database');
    }

    for (const provider of providers) {
      const usage = await this.db.ocrUsage.findUnique({
        where: {
          providerId_month_year: {
            providerId: provider.id,
            month,
            year,
          },
        },
      });

      if (!usage || usage.count < 1000) {
        return {
          keyFilename: provider.keyFilename,
          projectId: provider.projectId,
          providerId: provider.id,
        };
      }
    }

    const lastProvider = providers[providers.length - 1];
    return {
      keyFilename: lastProvider.keyFilename,
      projectId: lastProvider.projectId,
      providerId: lastProvider.id,
    };
  };

  /**
   * Increment the usage count for a specific provider in the current month/year
   */
  incrementUsage = async (providerId: string): Promise<void> => {
    const now = dayjs();
    const month = now.month() + 1;
    const year = now.year();

    await this.db.ocrUsage.upsert({
      where: {
        providerId_month_year: {
          providerId,
          month,
          year,
        },
      },
      update: {
        count: { increment: 1 },
      },
      create: {
        providerId,
        month,
        year,
        count: 1,
      },
    });
  };
}
