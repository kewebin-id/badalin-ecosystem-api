import { IUsecaseResponse } from '@/shared/utils';
import { AdminLoginDto } from '../dto/admin-auth.dto';

export interface IAdminAuthUseCase {
  login: (dto: AdminLoginDto) => Promise<IUsecaseResponse<{
    user: {
      id: string;
      email: string;
      phoneNumber: string;
      fullName: string | null;
      role: string;
    };
    token: string;
  }>>;
}
