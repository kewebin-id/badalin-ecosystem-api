import { IUsecaseResponse } from '@/shared/utils';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Agency } from '@prisma/client';
import dayjs from 'dayjs';
import { IProviderAuthRepository } from '@/packages/visa/provider/auth';
import { UpdateAgencySettingsDto } from '../dto/agency-settings.dto';
import { IAgencySettingsRepository } from '../ports/agency-settings.repository.port';
import { IAgencySettingsUseCase } from '../ports/agency-settings.usecase.port';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AgencySettingsUseCase implements IAgencySettingsUseCase {
  constructor(
    @Inject('IAgencySettingsRepository')
    private readonly repository: IAgencySettingsRepository,
    @Inject('IProviderAuthRepository')
    private readonly authRepository: IProviderAuthRepository,
    private readonly jwtService: JwtService,
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

  async updateAgencySettings(providerId: string, dto: UpdateAgencySettingsDto): Promise<IUsecaseResponse<Agency>> {
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

        const isInitialSetup = agency.slug.startsWith('temp-');

        if (!isInitialSetup) {
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
      }

      const updatedAgency = await this.repository.update(agency.id, dto as any, agency.slug);

      let newToken: string | undefined;
      if (dto.slug && dto.slug !== agency.slug) {
        const payload = {
          id: user.id,
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          role: user.role,
          agencySlug: updatedAgency.slug,
        };
        newToken = this.jwtService.sign(payload);
      }

      return {
        data: {
          ...updatedAgency,
          newToken,
        } as any,
      };
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
