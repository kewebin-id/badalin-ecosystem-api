import { IProviderAuthRepository } from '@/packages/visa/provider/auth';
import { IUsecaseResponse } from '@/shared/utils';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Agency, Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { UpdateAgencySettingsDto } from '../dto/agency-settings.dto';
import { IAgencySettingsRepository } from '../ports/agency-settings.repository.port';
import { IAgencySettingsUseCase } from '../ports/agency-settings.usecase.port';

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
        return {
          error: {
            message: 'Agency not found',
            code: HttpStatus.NOT_FOUND,
          },
        };
      }

      const agency = await this.repository.findBySlug(user.agencySlug);
      if (!agency) {
        return {
          error: {
            message: 'Agency data not found',
            code: HttpStatus.NOT_FOUND,
          },
        };
      }

      return {
        data: {
          ...agency,
          isSlugSetup: !agency.slug.startsWith('temp-'),
        } as any,
      };
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

  async updateAgencySettings(
    providerId: string,
    dto: UpdateAgencySettingsDto,
  ): Promise<IUsecaseResponse<Agency & { newToken?: string }>> {
    try {
      const user = await this.authRepository.findByIdentifier(providerId);
      if (!user) {
        return {
          error: {
            message: 'User not found',
            code: HttpStatus.NOT_FOUND,
          },
        };
      }

      const isFirstTimeSetup = !user?.agencySlug || user?.agencySlug === 'p';

      if (isFirstTimeSetup && dto?.slug) {
        const existing = await this.repository.findBySlug(dto?.slug);
        if (existing) {
          return {
            error: {
              message: 'Slug is already taken',
              code: HttpStatus.CONFLICT,
            },
          };
        }

        const newAgency = await this.repository.create({
          name: dto.name || user.fullName || 'New Agency',
          slug: dto.slug,
          visaPrice: new Prisma.Decimal(0),
          createdBy: user.id,
        });

        await this.authRepository.updateAgencySlug(user.id, newAgency.slug);

        user.agencySlug = newAgency.slug;
      }

      const agency = await this.repository.findBySlug(user.agencySlug!);
      if (!agency) {
        return {
          error: {
            message: 'Agency data not found',
            code: HttpStatus.NOT_FOUND,
          },
        };
      }

      if (dto.slug && dto.slug !== agency.slug) {
        const existing = await this.repository.findBySlug(dto.slug);
        if (existing) {
          return {
            error: {
              message: 'Slug is already taken',
              code: HttpStatus.CONFLICT,
            },
          };
        }

        const isInitialSetup = agency.slug.startsWith('temp-') || agency.slug === 'p';

        if (!isInitialSetup) {
          const lastUpdate = dayjs(agency.lastSlugUpdate);
          const now = dayjs();
          const daysSinceLastUpdate = now.diff(lastUpdate, 'day');

          if (daysSinceLastUpdate < 90) {
            const daysToWait = 90 - daysSinceLastUpdate;
            return {
              error: {
                code: 400,
                message: `Slug can only be changed once every 3 months. Please wait ${daysToWait} more day(s).`,
              },
            };
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
        },
      };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Failed to update agency settings',
          code: error instanceof HttpException ? error.getStatus() : 500,
        },
      };
    }
  async validateSession(providerId: string): Promise<IUsecaseResponse<{ valid: boolean }>> {
    try {
      const user = await this.authRepository.findByIdentifier(providerId);
      if (!user || !user.agencySlug) {
        return { data: { valid: false } };
      }

      const agency = await this.repository.findBySlug(user.agencySlug);
      if (!agency) {
        return { data: { valid: false } };
      }

      return { data: { valid: true } };
    } catch (error) {
      return { data: { valid: false } };
    }
  }
}
