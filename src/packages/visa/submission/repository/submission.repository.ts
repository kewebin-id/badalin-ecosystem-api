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
        rawdahMenTime: data.rawdahMenTime!,
        rawdahWomenTime: data.rawdahWomenTime!,
        members: {
          connect: memberIds.map((id) => ({ id })),
        },
        flights: {
          create: data.flights?.map((f) => ({
            type: f.type,
            flightNo: f.flightNo,
            carrier: f.carrier,
            flightDate: f.flightDate,
            eta: f.eta,
            etd: f.etd,
            createdBy: data.createdBy!,
          })),
        },
        hotels: {
          create: data.hotels?.map((h) => ({
            name: h.name,
            resvNo: h.resvNo,
            checkIn: h.checkIn,
            checkOut: h.checkOut,
            city: h.city,
            roomType: h.roomType,
            createdBy: data.createdBy!,
          })),
        },
        transportations: {
          create: data.transportations?.map((t) => ({
            type: t.type,
            company: t.company,
            time: t.time,
            date: t.date,
            from: t.from,
            to: t.to,
            totalVehicle: t.totalVehicle,
            totalH: t.totalH,
            createdBy: data.createdBy!,
          })),
        },
      },
      include: {
        members: true,
        flights: true,
        hotels: true,
        transportations: true,
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
      include: {
        members: true,
        flights: true,
        hotels: true,
        transportations: true,
      },
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
 
  async findAll(
    params: { page?: number; limit?: number; search?: string },
    ctx: IUserContext,
  ): Promise<{ data: VisaSubmissionEntity[]; total: number }> {
    const { page = 1, limit = 10, search = '' } = params;
    const skip = (page - 1) * limit;
 
    const where: Prisma.VisaSubmissionWhereInput = {
      ...this.getQueryFilter(ctx),
      ...(search
        ? {
            OR: [{ id: { contains: search, mode: 'insensitive' } }, { agencySlug: { contains: search, mode: 'insensitive' } }],
          }
        : {}),
    };
 
    const [total, submissions] = await Promise.all([
      this.db.visaSubmission.count({ where }),
      this.db.visaSubmission.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          members: true,
          flights: true,
          hotels: true,
          transportations: true,
        },
      }),
    ]);
 
    return {
      total,
      data: submissions.map(
        (s) =>
          new VisaSubmissionEntity({
            ...s,
            totalAmount: Number(s.totalAmount),
          }),
      ),
    };
  }
}
