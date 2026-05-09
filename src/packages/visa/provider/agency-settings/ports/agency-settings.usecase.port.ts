import { IUsecaseResponse } from '@/shared/utils';
import { Agency } from '@prisma/client';
import { UpdateAgencySettingsDto } from '../dto/agency-settings.dto';

export interface IAgencyResponse extends Agency {
  isSlugSetup: boolean;
  newToken?: string;
}

export interface IAgencySettingsUseCase {
  getAgencyData(providerId: string): Promise<IUsecaseResponse<IAgencyResponse>>;
  checkSlugAvailability(slug: string): Promise<IUsecaseResponse<{ available: boolean }>>;
  updateAgencySettings(
    providerId: string,
    dto: UpdateAgencySettingsDto,
  ): Promise<IUsecaseResponse<IAgencyResponse>>;
  validateSession(providerId: string): Promise<IUsecaseResponse<{ valid: boolean }>>;
  validateSlug(slug: string): Promise<IUsecaseResponse<{ name: string }>>;
}
