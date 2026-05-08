import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { clientDb } from '@/shared/utils/db';
import { AgencyStatus } from '@prisma/client';

@Injectable()
export class AgencyStatusGuard implements CanActivate {
  private readonly db = clientDb;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // We assume user context is already populated by JwtAuthGuard
    // ctx.agencySlug is usually used in this project based on other controllers
    const agencySlug = request.cookies?.agency_slug || user?.agency?.slug || user?.agencySlug;

    if (!agencySlug) {
      return true;
    }

    // 1. Check for overdue refunds and auto-restrict
    const overdueRefund = await this.db.visaSubmission.findFirst({
      where: {
        agencySlug: agencySlug,
        refundStatus: 'PENDING',
        refundDeadline: {
          lt: new Date(),
        },
      },
    });

    if (overdueRefund) {
      await this.db.agency.update({
        where: { slug: agencySlug },
        data: { status: AgencyStatus.RESTRICTED },
      });
    }

    // 2. Check current agency status
    const agency = await this.db.agency.findUnique({
      where: { slug: agencySlug },
      select: { status: true },
    });

    if (agency?.status === AgencyStatus.RESTRICTED) {
      throw new HttpException(
        'Your agency is currently RESTRICTED due to overdue refunds. Please settle all pending refunds to resume activity.',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
