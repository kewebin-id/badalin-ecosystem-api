import { IUsecaseResponse } from '@/shared/utils';
import { User } from '@prisma/client';
import { CheckUserDto, LoginDto, RegisterDto } from '../dto/auth.dto';

export interface IAuthUseCase {
  checkUser: (dto: CheckUserDto) => Promise<IUsecaseResponse<boolean>>;
  register: (dto: RegisterDto, agencySlug?: string) => Promise<IUsecaseResponse<User>>;
  login: (dto: LoginDto) => Promise<IUsecaseResponse<{
    user: {
      id: string;
      email: string;
      phoneNumber: string;
      agency: {
        name: string;
        slug: string;
        isActive: boolean;
      } | null;
    };
    token: string;
  }>>;
}

