import { IUsecaseResponse } from '@/shared/utils';
import { User } from '@prisma/client';
import {
  ProviderForgotPasswordDto,
  ProviderLoginDto,
  ProviderRegisterDto,
  ProviderResetPasswordDto,
} from '../dto/provider-auth.dto';

export interface IProviderAuthUseCase {
  register: (dto: ProviderRegisterDto) => Promise<IUsecaseResponse<User>>;
  login: (dto: ProviderLoginDto, isProviderAuth?: boolean) => Promise<IUsecaseResponse<any>>;
  verifyInvitationToken: (token: string) => Promise<IUsecaseResponse<{ email: string }>>;
  forgotPassword: (dto: ProviderForgotPasswordDto) => Promise<IUsecaseResponse<boolean>>;
  resetPassword: (dto: ProviderResetPasswordDto) => Promise<IUsecaseResponse<boolean>>;
}
