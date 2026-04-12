import { IUsecaseResponse } from '@/shared/utils';
import { AdminGenerateInvitationDto } from '../dto/admin-invitation.dto';

export interface IAdminInvitationUseCase {
  generateInvitation: (dto: AdminGenerateInvitationDto, adminId?: string) => Promise<IUsecaseResponse<boolean>>;
}
