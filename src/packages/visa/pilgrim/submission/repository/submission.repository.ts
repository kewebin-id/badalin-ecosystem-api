import { clientDb } from '@/shared/utils/db';
import { Injectable, Logger } from '@nestjs/common';
import { PaymentStatus, VerifyStatus } from '@prisma/client';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { IVisaSubmissionRepository } from '../ports/submission.repository.port';
import { VisaSubmissionEntity } from '../domain/submission.entity';

@Injectable()
export class VisaSubmissionRepository implements IVisaSubmissionRepository {
  private readonly db = clientDb;

  async findById(id: string, ctx?: IUserContext): Promise<VisaSubmissionEntity | null> {
    const submission = await this.db.visaSubmission.findUnique({
      where: { id },
      include: {
        flights: true,
        hotels: true,
        transportations: true,
        members: {
          select: { id: true, fullName: true, passportNumber: true },
        },
      },
    });

    return submission as any;
  }

  async findAll(
    params: { page?: number; limit?: number; search?: string },
    ctx: IUserContext,
  ): Promise<{ data: VisaSubmissionEntity[]; total: number }> {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      agencySlug: ctx.agencySlug || undefined,
      leaderId: ctx.role === 'PILGRIM' ? ctx.id : undefined,
    };

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { leader: { fullName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.db.visaSubmission.findMany({
        where,
        skip,
        take: limit,
        include: {
          members: { select: { id: true, fullName: true, passportNumber: true } },
          leader: { select: { fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.db.visaSubmission.count({ where }),
    ]);

    return { data: data as any, total };
  }

  async create(data: any, ctx: IUserContext): Promise<VisaSubmissionEntity> {
    const { agencySlug, pilgrimIds, flights, hotels, transportations, ...submissionData } = data;

    return this.db.$transaction(async (tx) => {
      const submission = await tx.visaSubmission.create({
        data: {
          ...submissionData,
          agency: { connect: { slug: agencySlug } },
          leader: { connect: { id: ctx.id } },
          members: { connect: pilgrimIds.map((id: string) => ({ id })) },
          flights: flights
            ? {
                create: flights.map((f: any) => ({
                  ...f,
                  createdBy: ctx.id,
                })),
              }
            : undefined,
          hotels: hotels
            ? {
                create: hotels.map((h: any) => ({
                  ...h,
                  createdBy: ctx.id,
                })),
              }
            : undefined,
          transportations: transportations
            ? {
                create: transportations.map((t: any) => ({
                  ...t,
                  createdBy: ctx.id,
                })),
              }
            : undefined,
          createdBy: ctx.id,
        },
        include: {
          members: true,
          flights: true,
          hotels: true,
          transportations: true,
        },
      });

      return submission as any;
    });
  }

  async update(
    id: string,
    data: Partial<VisaSubmissionEntity>,
    pilgrimIds: string[],
    ctx: IUserContext,
  ): Promise<VisaSubmissionEntity> {
    return this.db.$transaction(async (tx) => {
      const updateData: any = { ...data };
      if (pilgrimIds && pilgrimIds.length > 0) {
        updateData.members = { set: pilgrimIds.map((pid) => ({ id: pid })) };
      }

      return tx.visaSubmission.update({
        where: { id },
        data: updateData,
        include: { members: true },
      }) as any;
    });
  }

  async createManifests(id: string, manifests: any, ctx: IUserContext): Promise<VisaSubmissionEntity> {
    const { flights, hotels, transportations } = manifests;

    return this.db.$transaction(async (tx) => {
      if (flights && flights.length > 0) {
        await tx.flightManifest.createMany({
          data: flights.map((f: any) => ({ ...f, submissionId: id, createdBy: ctx.id })),
        });
      }
      if (hotels && hotels.length > 0) {
        await tx.hotelManifest.createMany({
          data: hotels.map((h: any) => ({ ...h, submissionId: id, createdBy: ctx.id })),
        });
      }
      if (transportations && transportations.length > 0) {
        await tx.transportationManifest.createMany({
          data: transportations.map((t: any) => ({ ...t, submissionId: id, createdBy: ctx.id })),
        });
      }

      return this.findById(id, ctx) as any;
    });
  }

  async review(id: string, status: VerifyStatus, reason: string | null, ctx: IUserContext): Promise<VisaSubmissionEntity> {
    return this.db.visaSubmission.update({
      where: { id },
      data: {
        verifyStatus: status,
        status: status,
        rejectionReason: reason,
        verifierId: ctx.id,
        verifiedAt: new Date(),
        updatedBy: ctx.id,
      },
      include: { members: true },
    }) as any;
  }
}
