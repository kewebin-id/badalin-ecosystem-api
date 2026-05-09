import { clientDb } from '@/shared/utils/db';
import { Injectable } from '@nestjs/common';
import { PaymentStatus, VerifyStatus } from '@prisma/client';
import { IProviderDashboardRepository } from '../ports/dashboard.repository.port';
import { IDashboardStats, IDashboardActivity, IVisaTrend } from '../ports/dashboard.usecase.port';
import dayjs from 'dayjs';

@Injectable()
export class ProviderDashboardRepository implements IProviderDashboardRepository {
  private readonly db = clientDb;

  async getStats(agencySlug: string): Promise<IDashboardStats> {
    const [total, pendingPayment, inReview, issued] = await Promise.all([
      this.db.visaSubmission.count({ where: { agencySlug } }),
      this.db.visaSubmission.count({
        where: {
          agencySlug,
          paymentStatus: PaymentStatus.PENDING,
        },
      }),
      this.db.visaSubmission.count({
        where: {
          agencySlug,
          reviewStatus: VerifyStatus.IN_REVIEW,
        },
      }),
      this.db.visaSubmission.count({
        where: {
          agencySlug,
          status: VerifyStatus.ISSUED,
        },
      }),
    ]);

    return {
      totalSubmissions: total,
      pendingPayments: pendingPayment,
      documentsInReview: inReview,
      issuedVisas: issued,
    };
  }

  async getRecentActivities(agencySlug: string, limit: number): Promise<IDashboardActivity[]> {
    const activities = await this.db.visaSubmission.findMany({
      where: { agencySlug },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        leader: { select: { fullName: true } },
      },
    });

    return activities.map((a) => ({
      id: a.id,
      description: a.leader.fullName || 'Unknown',
      status: a.reviewStatus,
      timestamp: a.updatedAt,
      type: this.getActivityType(a.reviewStatus),
    }));
  }

  private getActivityType(status: VerifyStatus): 'payment' | 'visa' | 'manifest' {
    if (status === VerifyStatus.IN_REVIEW) return 'visa';
    if (status === VerifyStatus.VERIFIED) return 'visa';
    if (status === VerifyStatus.REJECTED) return 'visa';
    return 'payment';
  }

  async getVisaTrends(agencySlug: string): Promise<IVisaTrend[]> {
    const now = dayjs();
    const last6Months = Array.from({ length: 6 }).map((_, i) =>
      now.subtract(i, 'month').startOf('month'),
    ).reverse();

    const trends = await Promise.all(
      last6Months.map(async (date) => {
        const count = await this.db.visaSubmission.count({
          where: {
            agencySlug,
            createdAt: {
              gte: date.toDate(),
              lt: date.endOf('month').toDate(),
            },
          },
        });
        return {
          month: date.format('MMM'),
          visas: count,
        };
      }),
    );

    return trends;
  }
}
