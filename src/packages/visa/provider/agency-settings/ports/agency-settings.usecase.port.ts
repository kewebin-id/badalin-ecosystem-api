import { IUsecaseResponse } from '@/shared/utils';
import { Agency } from '@prisma/client';
import { UpdateAgencySettingsDto } from '../dto/agency-settings.dto';

export interface IAgencySettingsUseCase {
  getAgencyData(providerId: string): Promise<IUsecaseResponse<Agency>>;
  checkSlugAvailability(slug: string): Promise<IUsecaseResponse<{ available: boolean }>>;
  updateAgencySettings(providerId: string, dto: UpdateAgencySettingsDto): Promise<IUsecaseResponse<Agency>>;
}
