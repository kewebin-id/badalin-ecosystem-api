import { IUsecaseResponse } from '@/shared/utils';
import { User } from '@prisma/client';
import {
  PilgrimCheckUserDto,
  PilgrimForgotPasswordDto,
  PilgrimLoginDto,
  PilgrimRegisterDto,
  PilgrimResetPasswordDto,
  PilgrimVerifyResetTokenDto,
} from '../dto/pilgrim-auth.dto';

export interface IPilgrimAuthUseCase {
  checkUser: (dto: PilgrimCheckUserDto) => Promise<IUsecaseResponse<boolean>>;
  register: (dto: PilgrimRegisterDto, agencySlug?: string) => Promise<IUsecaseResponse<User>>;
  login: (dto: PilgrimLoginDto) => Promise<IUsecaseResponse<{
    user: {
      id: string;
      email: string;
      phoneNumber: string;
      fullName: string | null;
      role: string;
    };
    token: string;
  }>>;
  forgotPassword: (dto: PilgrimForgotPasswordDto) => Promise<IUsecaseResponse<boolean>>;
  verifyResetToken: (dto: PilgrimVerifyResetTokenDto) => Promise<IUsecaseResponse<boolean>>;
  resetPassword: (dto: PilgrimResetPasswordDto) => Promise<IUsecaseResponse<boolean>>;
}
