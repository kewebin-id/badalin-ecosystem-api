import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePilgrimDto, UpdatePilgrimDto } from '../dto/pilgrim.dto';
import { IPilgrimUseCase } from '../ports/i.usecase';
import { IPilgrimRepository } from '../ports/i.repository';
import { Pilgrim } from '@prisma/client';

@Injectable()
export class PilgrimUseCase implements IPilgrimUseCase {
  constructor(
    @Inject('IPilgrimRepository')
    private readonly repository: IPilgrimRepository,
  ) {}

  findAll = async (leaderId: string, agencySlug: string): Promise<Pilgrim[]> => {
    return this.repository.findAll(leaderId, agencySlug);
  };

  create = async (leaderId: string, agencySlug: string, dto: CreatePilgrimDto): Promise<Pilgrim> => {
    this.validateOcr(dto);
    const { ocrConfidence, dob, passportExpiry, ...data } = dto;
    const status = this.checkPassportExpiry(passportExpiry);

    return this.repository.create({
      ...data,
      birthDate: new Date(dob),
      passportExpiry: new Date(passportExpiry),
      leaderId,
      agencySlug,
      isComplete: status === 'Active',
    });
  };

  update = async (id: string, leaderId: string, agencySlug: string, dto: UpdatePilgrimDto): Promise<Pilgrim> => {
    const pilgrim = await this.repository.findById(id, leaderId, agencySlug);

    if (!pilgrim) {
      throw new NotFoundException('Pilgrim not found');
    }

    this.validateOcr(dto);
    const { ocrConfidence, dob, passportExpiry, ...data } = dto;
    const status = this.checkPassportExpiry(passportExpiry);

    return this.repository.update(id, {
      ...data,
      birthDate: new Date(dob),
      passportExpiry: new Date(passportExpiry),
      isComplete: status === 'Active',
    });
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
