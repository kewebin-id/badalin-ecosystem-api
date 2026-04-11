import { IUsecaseResponse } from '@/shared/utils';
import { Agency } from '@prisma/client';
import { UpdateAgencyDto } from '../dto/agency.dto';

export interface IAgencyUseCase {
  getAgencyData: (providerId: string) => Promise<IUsecaseResponse<Agency>>;
  checkSlugAvailability: (slug: string) => Promise<IUsecaseResponse<{ available: boolean }>>;
  updateAgencySettings: (providerId: string, dto: UpdateAgencyDto) => Promise<IUsecaseResponse<Agency>>;
}
