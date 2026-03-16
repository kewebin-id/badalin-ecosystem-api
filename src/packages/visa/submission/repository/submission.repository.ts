import { IVisaSubmissionRepository } from '../ports';
import { VisaSubmissionEntity } from '../domain/submission.entity';
import { PaymentStatus, VerifyStatus, Pilgrim, Agency, Prisma } from '@prisma/client';
import { clientDb } from '@/shared/utils/db';

export class PrismaVisaSubmissionRepository implements IVisaSubmissionRepository {
  private readonly db = clientDb;

  async create(data: Partial<VisaSubmissionEntity>, memberIds: string[]): Promise<VisaSubmissionEntity> {
    const submission = await this.db.visaSubmission.create({
      data: {
        leaderId: data.leaderId!,
        agencySlug: data.agencySlug!,
        totalAmount: data.totalAmount!,
        resultSnapshot: (data.resultSnapshot as Prisma.InputJsonValue) ?? Prisma.DbNull,
        createdBy: data.createdBy!,
        status: data.status || VerifyStatus.IN_REVIEW,
        verifyStatus: data.verifyStatus || VerifyStatus.IN_REVIEW,
        paymentStatus: data.paymentStatus || PaymentStatus.PENDING,
        flightEta: data.flightEta,
        flightEtd: data.flightEtd,
        hotelCheckin: data.hotelCheckin,
        hotelCheckout: data.hotelCheckout,
        transportType: data.transportType,
        tripRoute: data.tripRoute,
        members: {
          connect: memberIds.map((id) => ({ id })),
        },
      },
      include: {
        members: true,
      },
    });

    return new VisaSubmissionEntity({
      ...submission,
      totalAmount: Number(submission.totalAmount),
    });
  }

  async findById(id: string): Promise<VisaSubmissionEntity | null> {
    const submission = await this.db.visaSubmission.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!submission) return null;

    return new VisaSubmissionEntity({
      ...submission,
      totalAmount: Number(submission.totalAmount),
    });
  }

  async updateStatus(id: string, status: VerifyStatus): Promise<VisaSubmissionEntity> {
    const submission = await this.db.visaSubmission.update({
      where: { id },
      data: { status, verifyStatus: status },
    });

    return new VisaSubmissionEntity({
      ...submission,
      totalAmount: Number(submission.totalAmount),
    });
  }

  async updatePaymentStatus(id: string, status: PaymentStatus, proofOfPayment?: string): Promise<VisaSubmissionEntity> {
    const submission = await this.db.visaSubmission.update({
      where: { id },
      data: { paymentStatus: status, proofOfPayment },
    });

    return new VisaSubmissionEntity({
      ...submission,
      totalAmount: Number(submission.totalAmount),
    });
  }

  async findGroupMembers(leaderId: string): Promise<Pilgrim[]> {
    return this.db.pilgrim.findMany({
      where: { leaderId },
    });
  }

  async findAgencyBySlug(agencySlug: string): Promise<Agency | null> {
    return this.db.agency.findUnique({
      where: { slug: agencySlug },
    });
  }

  async findPilgrimsByIds(ids: string[]): Promise<Pilgrim[]> {
    return this.db.pilgrim.findMany({
      where: {
        id: { in: ids },
      },
    });
  }
}
