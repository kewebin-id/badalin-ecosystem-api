import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { clientDb } from '@/shared/utils/db';
import { CreatePilgrimDto, UpdatePilgrimDto } from '../dto/pilgrim.dto';
import { IPilgrimUseCase } from '../ports/i.usecase';
import { IPilgrimRepository, IUserContext } from '../ports/i.repository';
import { Pilgrim } from '@prisma/client';
import { Pagination, PaginationDto } from '@/shared/utils/rest-api/pagination';
import { IPaginationResponse } from '@/shared/utils/rest-api/types';

@Injectable()
export class PilgrimUseCase implements IPilgrimUseCase {
  constructor(
    @Inject('IPilgrimRepository')
    private readonly repository: IPilgrimRepository,
  ) {}

  findAll = async (ctx: IUserContext, paginationDto: PaginationDto): Promise<IPaginationResponse<Pilgrim>> => {
    const pagination = new Pagination(paginationDto.page, paginationDto.limit);
    const result = await this.repository.findAll(ctx, pagination.offset, pagination.limit);
    return pagination.paginate(result);
  };

  create = async (ctx: IUserContext, dto: CreatePilgrimDto): Promise<Pilgrim> => {
    this.validateOcr(dto);
    const status = this.checkPassportExpiry(dto.passportExpiry);

    const { dob, selfieUrl, ocrConfidence, ...dtoData } = dto;

    const pilgrim = await this.repository.create({
      ...dtoData,
      leaderId: ctx.id,
      agencySlug: ctx.agencySlug,
      birthDate: new Date(dob),
      passportExpiry: new Date(dto.passportExpiry),
      isComplete: status === 'Active',
      photoUrl: dto.photoUrl || selfieUrl,
    });

    if (dto.relation === 'Saya Sendiri' && (dto.photoUrl || selfieUrl)) {
      await this.syncUserPhoto(ctx.id, (dto.photoUrl || selfieUrl) as string);
    }

    return pilgrim;
  };

  update = async (id: string, ctx: IUserContext, dto: UpdatePilgrimDto): Promise<Pilgrim> => {
    const pilgrim = await this.repository.findById(id, ctx);

    if (!pilgrim) {
      throw new NotFoundException('Pilgrim not found or access denied');
    }

    this.validateOcr(dto);
    const { ocrConfidence, dob, passportExpiry, selfieUrl, ...dtoData } = dto;
    const status = this.checkPassportExpiry(passportExpiry);

    const photoUrl = dto.photoUrl || selfieUrl;

    const result = await this.repository.update(
      id,
      {
        ...dtoData,
        photoUrl,
        birthDate: new Date(dob),
        passportExpiry: new Date(passportExpiry),
        isComplete: status === 'Active',
      },
      ctx,
    );

    if (dto.relation === 'Saya Sendiri' && photoUrl) {
      await this.syncUserPhoto(ctx.id, photoUrl as string);
    }

    return result;
  };

  private syncUserPhoto = async (userId: string, photoUrl: string) => {
    try {
      await clientDb.user.update({
        where: { id: userId },
        data: { photoUrl },
      });
    } catch (error) {
    }
  };

  delete = async (id: string, ctx: IUserContext): Promise<Pilgrim> => {
    const pilgrim = await this.repository.findById(id, ctx);

    if (!pilgrim) {
      throw new NotFoundException('Pilgrim not found or access denied');
    }

    return this.repository.delete(id, ctx);
  };

  private validateOcr = (dto: CreatePilgrimDto | UpdatePilgrimDto) => {
    if (dto.ocrConfidence !== undefined && dto.ocrConfidence < 70) {
      throw new BadRequestException('OCR confidence too low. Please input data manually.');
    }
  };

  private checkPassportExpiry = (expiryDate: string): 'Active' | 'Non-Aktif' => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    return expiry < now ? 'Non-Aktif' : 'Active';
  };
}
