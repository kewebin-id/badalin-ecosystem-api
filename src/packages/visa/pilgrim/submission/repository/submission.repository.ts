import { clientDb } from '@/shared/utils/db';
import { IUserContext } from '@/shared/utils/rest-api/types';
import { Injectable } from '@nestjs/common';
import { FlightType, HotelCity, Prisma, RoomType, TransportType, VerifyStatus } from '@prisma/client';
import { PaymentProofSnapshot, VisaSubmissionEntity } from '../domain/submission.entity';
import {
  IManifestsInput,
  IMemberReview,
  IVisaSubmissionCreateInput,
  IVisaSubmissionRepository,
} from '../ports/submission.repository.port';

@Injectable()
export class VisaSubmissionRepository implements IVisaSubmissionRepository {
  private readonly db = clientDb;

  async findById(id: string): Promise<VisaSubmissionEntity | null> {
    const submission = await this.db.visaSubmission.findUnique({
      where: { id },
      include: {
        flights: true,
        hotels: true,
        transportations: true,
        agency: {
          select: {
            bankName: true,
            bankAccountName: true,
            bankAccountNumber: true,
            status: true,
          },
        },
        members: {
          select: {
            id: true,
            fullName: true,
            passportNumber: true,
            passportExpiry: true,
            relation: true,
            nik: true,
            gender: true,
            birthDate: true,
            maritalStatus: true,
            photoUrl: true,
            ktpUrl: true,
            passportUrl: true,
          },
        },
        leader: {
          select: {
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    return submission as unknown as VisaSubmissionEntity;
  }

  async findAll(
    params: { page?: number; limit?: number; search?: string },
    ctx: IUserContext,
  ): Promise<{ data: VisaSubmissionEntity[]; total: number }> {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.VisaSubmissionWhereInput = {
      leaderId: ctx.role === 'PILGRIM' ? ctx.id : undefined,
      agencySlug: ctx.agencySlug || undefined,
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
          agency: {
            select: {
              bankName: true,
              bankAccountName: true,
              bankAccountNumber: true,
            },
          },
          members: {
            select: {
              id: true,
              fullName: true,
              passportNumber: true,
              relation: true,
            },
          },
          leader: { select: { fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.db.visaSubmission.count({ where }),
    ]);

    return { data: data as unknown as VisaSubmissionEntity[], total };
  }

  async create(data: IVisaSubmissionCreateInput, ctx: IUserContext): Promise<VisaSubmissionEntity> {
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
                create: flights.map((f) => ({
                  ...f,
                  type: f.type as FlightType,
                  flightDate: new Date(f.flightDate),
                  eta: new Date(f.eta),
                  etd: new Date(f.etd),
                  createdBy: ctx.id,
                })),
              }
            : undefined,
          hotels: hotels
            ? {
                create: hotels.map((h) => ({
                  ...h,
                  city: h.city as HotelCity,
                  roomType: h.roomType as RoomType,
                  checkIn: new Date(h.checkIn),
                  checkOut: new Date(h.checkOut),
                  createdBy: ctx.id,
                })),
              }
            : undefined,
          transportations: transportations
            ? {
                create: transportations.map((t) => ({
                  ...t,
                  type: t.type as TransportType,
                  date: new Date(t.date),
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

      return submission as unknown as VisaSubmissionEntity;
    });
  }

  async update(
    id: string,
    data: Partial<VisaSubmissionEntity>,
    pilgrimIds: string[],
    ctx: IUserContext,
  ): Promise<VisaSubmissionEntity> {
    return this.db.$transaction(async (tx) => {
      const { members, flights, hotels, transportations, agency, ...scalarData } = data;
      const updateData: Prisma.VisaSubmissionUpdateInput = {
        ...(scalarData as Prisma.VisaSubmissionUpdateInput),
      };

      if (pilgrimIds && pilgrimIds.length > 0) {
        updateData.members = { set: pilgrimIds.map((pid: string) => ({ id: pid })) };
      }

      const submission = await tx.visaSubmission.update({
        where: { id },
        data: updateData,
        include: { members: true },
      });

      return submission as unknown as VisaSubmissionEntity;
    });
  }

  async createManifests(id: string, manifests: IManifestsInput, ctx: IUserContext): Promise<VisaSubmissionEntity> {
    const { flights, hotels, transportations } = manifests;

    return this.db.$transaction(async (tx) => {
      if (flights && flights.length > 0) {
        await tx.flightManifest.createMany({
          data: flights.map((f) => ({
            ...f,
            type: f.type as FlightType,
            flightDate: new Date(f.flightDate),
            eta: new Date(f.eta),
            etd: new Date(f.etd),
            submissionId: id,
            createdBy: ctx.id,
          })),
        });
      }
      if (hotels && hotels.length > 0) {
        await tx.hotelManifest.createMany({
          data: hotels.map((h) => ({
            ...h,
            city: h.city as HotelCity,
            roomType: h.roomType as RoomType,
            checkIn: new Date(h.checkIn),
            checkOut: new Date(h.checkOut),
            submissionId: id,
            createdBy: ctx.id,
          })),
        });
      }
      if (transportations && transportations.length > 0) {
        await tx.transportationManifest.createMany({
          data: transportations.map((t) => ({
            ...t,
            type: t.type as TransportType,
            date: new Date(t.date),
            submissionId: id,
            createdBy: ctx.id,
          })),
        });
      }

      const submission = await this.findById(id);
      return submission as VisaSubmissionEntity;
    });
  }

  async review(
    id: string,
    status: VerifyStatus,
    reason: string | null,
    resultSnapshot: PaymentProofSnapshot | null,
    memberReviews: IMemberReview[] | null,
    ctx: IUserContext,
  ): Promise<VisaSubmissionEntity> {
    const existing = await this.db.visaSubmission.findUnique({
      where: { id },
      include: { agency: true },
    });

    if (!existing) throw new Error('Submission not found');

    const mergedSnapshot = {
      ...((existing?.resultSnapshot as object) || {}),
      ...(resultSnapshot || {}),
    };

    let refundAmount = 0;
    let refundStatus = 'NONE';
    let refundDeadline: Date | null = null;

    return this.db.$transaction(async (tx) => {
      // 1. Update individual pilgrims if memberReviews provided
      if (memberReviews && memberReviews.length > 0) {
        for (const m of memberReviews) {
          await tx.pilgrim.update({
            where: { id: m.id },
            data: {
              isEligible: m.isEligible,
              rejectionReason: m.rejectionReason,
              updatedBy: ctx.id,
            },
          });
        }

        // Calculate refund if payment is already COMPLETED
        if (existing.paymentStatus === 'COMPLETED') {
          const rejectedCount = memberReviews.filter((m) => !m.isEligible).length;
          if (rejectedCount > 0) {
            const visaPrice = Number(existing.agency.visaPrice);
            refundAmount = rejectedCount * visaPrice;
            refundStatus = 'PENDING';
            refundDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
          }
        }
      }

      const submission = await tx.visaSubmission.update({
        where: { id },
        data: {
          verifyStatus: status,
          status: status,
          rejectionReason: reason,
          resultSnapshot: mergedSnapshot,
          verifierId: ctx.id,
          verifiedAt: new Date(),
          refundAmount,
          refundStatus,
          refundDeadline,
          updatedBy: ctx.id,
        },
        include: {
          members: true,
          flights: true,
          hotels: true,
          transportations: true,
        },
      });

      return submission as unknown as VisaSubmissionEntity;
    });
  }

  async uploadProof(
    id: string,
    proofUrl: string,
    ocrData: PaymentProofSnapshot | null,
    ctx: IUserContext,
  ): Promise<VisaSubmissionEntity> {
    const submission = await this.db.visaSubmission.update({
      where: { id },
      data: {
        proofOfPayment: proofUrl,
        paymentStatus: 'CHECKING',
        resultSnapshot: ocrData || undefined,
        updatedBy: ctx.id,
      },
      include: {
        members: true,
        agency: true,
      },
    });

    return submission as unknown as VisaSubmissionEntity;
  }

  async submitVisas(
    id: string,
    visaFiles: Record<string, { name: string; base64: string }[]>,
    ctx: IUserContext,
  ): Promise<VisaSubmissionEntity> {
    const submission = await this.db.visaSubmission.findUnique({
      where: { id },
    });

    if (!submission) throw new Error('Submission not found');

    const visaUrls: Record<string, string> = {};
    const { uploadFile } = await import('@/shared/utils/upload.util');

    for (const [memberId, files] of Object.entries(visaFiles)) {
      if (files && files.length > 0) {
        const url = await uploadFile(files[0].base64, 'visas', `visa-${id}-${memberId}`);
        visaUrls[memberId] = url;
      }
    }

    const currentSnapshot = (submission.resultSnapshot as any) || {};
    const updatedSnapshot = {
      ...currentSnapshot,
      visaUrls,
    };

    const updated = await this.db.visaSubmission.update({
      where: { id },
      data: {
        resultSnapshot: updatedSnapshot as any,
        updatedBy: ctx.id,
        // Trigger any side effects here if needed
      },
      include: {
        members: true,
        flights: true,
        hotels: true,
        transportations: true,
      },
    });

    return updated as unknown as VisaSubmissionEntity;
  }
}
