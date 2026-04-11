import { IUsecaseResponse } from '@/shared/utils';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Agency } from '@prisma/client';
import dayjs from 'dayjs';
import { IProviderAuthRepository } from '../../auth/ports/i-provider-auth.repository';
import { UpdateAgencyDto } from '../dto/agency.dto';
import { IAgencyRepository } from '../ports/i.repository';
import { IAgencyUseCase } from '../ports/i.usecase';

@Injectable()
export class AgencyUseCase implements IAgencyUseCase {
  constructor(
    @Inject('IAgencyRepository')
    private readonly repository: IAgencyRepository,
    @Inject('IProviderAuthRepository')
    private readonly authRepository: IProviderAuthRepository,
  ) {}

  async getAgencyData(providerId: string): Promise<IUsecaseResponse<Agency>> {
    try {
      const user = await this.authRepository.findByIdentifier(providerId);
      if (!user || !user.agencySlug) {
        throw new HttpException('Agency not found', HttpStatus.NOT_FOUND);
      }

      const agency = await this.repository.findBySlug(user.agencySlug);
      if (!agency) {
        throw new HttpException('Agency data not found', HttpStatus.NOT_FOUND);
      }

      return { data: agency };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch agency data',
          code: error instanceof HttpException ? error.getStatus() : 500,
        },
      };
    }
  }

  async checkSlugAvailability(slug: string): Promise<IUsecaseResponse<{ available: boolean }>> {
    try {
      const existing = await this.repository.findBySlug(slug);
      return { data: { available: !existing } };
    } catch (error) {
      return {
        error: {
          message: 'Failed to check slug availability',
          code: 500,
        },
      };
    }
  }

  async updateAgencySettings(providerId: string, dto: UpdateAgencyDto): Promise<IUsecaseResponse<Agency>> {
    try {
      const user = await this.authRepository.findByIdentifier(providerId);
      if (!user || !user.agencySlug) {
        throw new HttpException('Agency not found', HttpStatus.NOT_FOUND);
      }

      const agency = await this.repository.findBySlug(user.agencySlug);
      if (!agency) {
        throw new HttpException('Agency data not found', HttpStatus.NOT_FOUND);
      }

      if (dto.slug && dto.slug !== agency.slug) {
        const existing = await this.repository.findBySlug(dto.slug);
        if (existing) {
          throw new HttpException('Slug is already taken', HttpStatus.CONFLICT);
        }

        const lastUpdate = dayjs(agency.lastSlugUpdate);
        const now = dayjs();
        const daysSinceLastUpdate = now.diff(lastUpdate, 'day');

        if (daysSinceLastUpdate < 90) {
          const daysToWait = 90 - daysSinceLastUpdate;
          throw new HttpException(
            `Slug can only be changed once every 3 months. Please wait ${daysToWait} more day(s).`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const updatedAgency = await this.repository.update(agency.id, dto as any, agency.slug);

      return { data: updatedAgency };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Failed to update agency settings',
          code: error instanceof HttpException ? error.getStatus() : 500,
        },
      };
    }
  }
}
