import { IVisaSubmissionRepository } from '../ports';
import { VisaSubmissionEntity } from '../domain/submission.entity';
import { PaymentStatus, VerifyStatus, Pilgrim, Agency, Prisma, UserRole } from '@prisma/client';
import { clientDb } from '@/shared/utils/db';
import { IUserContext } from '@/shared/utils/rest-api/types';

export class PrismaVisaSubmissionRepository implements IVisaSubmissionRepository {
  private readonly db = clientDb;

  private getQueryFilter(ctx: IUserContext) {
    if (ctx.role === UserRole.SUPERADMIN) return {};
    if (ctx.role === UserRole.PROVIDER) return { agencySlug: ctx.agencySlug };
    return { leaderId: ctx.id, agencySlug: ctx.agencySlug };
  }

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
        flightNo: data.flightNo!,
        carrier: data.carrier!,
        flightDate: data.flightDate!,
        hotelMakkahName: data.hotelMakkahName!,
        hotelMadinahName: data.hotelMadinahName!,
        hotelMakkahResvNo: data.hotelMakkahResvNo!,
        hotelMadinahResvNo: data.hotelMadinahResvNo!,
        roomType: data.roomType as Exclude<typeof data.roomType, undefined>,
        busCompany: data.busCompany!,
        busTime: data.busTime!,
        totalBus: data.totalBus!,
        trainDate: data.trainDate!,
        trainFrom: data.trainFrom!,
        trainTo: data.trainTo!,
        trainTime: data.trainTime!,
        trainTotalH: data.trainTotalH!,
        rawdahMenTime: data.rawdahMenTime!,
        rawdahWomenTime: data.rawdahWomenTime!,
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

  async findById(id: string, ctx: IUserContext): Promise<VisaSubmissionEntity | null> {
    const submission = await this.db.visaSubmission.findFirst({
      where: { id, ...this.getQueryFilter(ctx) },
      include: { members: true },
    });

    if (!submission) return null;

    return new VisaSubmissionEntity({
      ...submission,
      totalAmount: Number(submission.totalAmount),
    });
  }

  async updateStatus(id: string, status: VerifyStatus, ctx: IUserContext): Promise<VisaSubmissionEntity> {
    const exists = await this.findById(id, ctx);
    if (!exists) throw new Error('Visa submission not found or access denied');

    const submission = await this.db.visaSubmission.update({
      where: { id },
      data: { status, verifyStatus: status },
    });

    return new VisaSubmissionEntity({
      ...submission,
      totalAmount: Number(submission.totalAmount),
    });
  }

  async updatePaymentStatus(
    id: string,
    status: PaymentStatus,
    ctx: IUserContext,
    proofOfPayment?: string,
  ): Promise<VisaSubmissionEntity> {
    const exists = await this.findById(id, ctx);
    if (!exists) throw new Error('Visa submission not found or access denied');

    const submission = await this.db.visaSubmission.update({
      where: { id },
      data: { paymentStatus: status, proofOfPayment },
    });

    return new VisaSubmissionEntity({
      ...submission,
      totalAmount: Number(submission.totalAmount),
    });
  }

  async findGroupMembers(leaderId: string, agencySlug: string): Promise<Pilgrim[]> {
    return this.db.pilgrim.findMany({
      where: { leaderId, agencySlug },
    });
  }

  async findAgencyBySlug(agencySlug: string): Promise<Agency | null> {
    return this.db.agency.findUnique({
      where: { slug: agencySlug },
    });
  }

  async findPilgrimsByIds(ids: string[], ctx: IUserContext): Promise<Pilgrim[]> {
    return this.db.pilgrim.findMany({
      where: {
        id: { in: ids },
        ...this.getQueryFilter(ctx),
      },
    });
  }
}
