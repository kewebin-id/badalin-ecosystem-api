import { IUsecaseResponse } from '@/shared/utils';
import { AdminGenerateInvitationDto, AdminLoginDto } from '../dto/admin-auth.dto';

export interface IAdminAuthUseCase {
  generateInvitation: (dto: AdminGenerateInvitationDto, adminId?: string) => Promise<IUsecaseResponse<boolean>>;
  login: (dto: AdminLoginDto) => Promise<IUsecaseResponse<any>>;
}
