import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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
    const { ocrConfidence, dob, passportExpiry, ...data } = dto;
    const status = this.checkPassportExpiry(passportExpiry);

    return this.repository.create({
      ...data,
      birthDate: new Date(dob),
      passportExpiry: new Date(passportExpiry),
      leaderId: ctx.id,
      agencySlug: ctx.agencySlug,
      isComplete: status === 'Active',
    });
  };

  update = async (id: string, ctx: IUserContext, dto: UpdatePilgrimDto): Promise<Pilgrim> => {
    const pilgrim = await this.repository.findById(id, ctx);

    if (!pilgrim) {
      throw new NotFoundException('Pilgrim not found or access denied');
    }

    this.validateOcr(dto);
    const { ocrConfidence, dob, passportExpiry, ...data } = dto;
    const status = this.checkPassportExpiry(passportExpiry);

    return this.repository.update(
      id,
      {
        ...data,
        birthDate: new Date(dob),
        passportExpiry: new Date(passportExpiry),
        isComplete: status === 'Active',
      },
      ctx,
    );
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
