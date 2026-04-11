import { IUsecaseResponse, globalLogger as Logger, sendResetPasswordEmail } from '@/shared/utils';
import { HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  ProviderForgotPasswordDto,
  ProviderLoginDto,
  ProviderRegisterDto,
  ProviderResetPasswordDto,
} from '../dto/provider-auth.dto';
import { IProviderAuthRepository } from '../ports/i-provider-auth.repository';
import { IProviderAuthUseCase } from '../ports/i-provider-auth.usecase';

@Injectable()
export class ProviderAuthUseCase implements IProviderAuthUseCase {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('IProviderAuthRepository')
    private readonly repository: IProviderAuthRepository,
  ) {}

  register = async (dto: ProviderRegisterDto): Promise<IUsecaseResponse<User>> => {
    try {
      const user = await this.repository.findByInvitationToken(dto.invitationToken);

      if (!user) {
        throw new UnauthorizedException('Invalid invitation token');
      }

      if (!user.invitationExpires || user.invitationExpires < new Date()) {
        throw new UnauthorizedException('Invitation token has expired');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const updatedUser = await this.repository.updateProviderAccount(user.id, {
        password: hashedPassword,
        fullName: dto.fullName,
        role: 'PROVIDER',
      });

      return { data: updatedUser };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Registration failed',
          code: error instanceof HttpException ? error.getStatus() : 500,
        },
      };
    }
  };

  verifyInvitationToken = async (token: string): Promise<IUsecaseResponse<{ email: string }>> => {
    try {
      const user = await this.repository.findByInvitationToken(token);

      if (!user) {
        throw new HttpException('Invalid invitation token', HttpStatus.NOT_FOUND);
      }

      if (!user.invitationExpires || user.invitationExpires < new Date()) {
        throw new HttpException('Invitation token has expired', HttpStatus.GONE);
      }

      if (user.role === 'PROVIDER' && user.password !== '') {
        throw new HttpException('This invitation token has already been used', HttpStatus.CONFLICT);
      }

      return { data: { email: user.email || '' } };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Token verification failed',
          code: error instanceof HttpException ? error.getStatus() : 500,
        },
      };
    }
  };

  login = async (
    dto: ProviderLoginDto,
  ): Promise<
    IUsecaseResponse<{
      user: {
        id: string;
        email: string;
        phoneNumber: string;
        fullName: string | null;
        role: string;
        photoUrl: string | null;
        agency: {
          name: string;
          slug: string;
          isActive: boolean;
        } | null;
      };
      token: string;
    }>
  > => {
    try {
      const user = await this.repository.findByIdentifier(dto.identifier);

      if (!user || !(await bcrypt.compare(dto.password, user.password))) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (user.role !== 'PROVIDER' && user.role !== 'SUPERADMIN') {
        throw new UnauthorizedException('Access denied: Unauthorized role');
      }

      const payload = {
        id: user.id,
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        role: user.role,
        agencySlug: user.agency?.slug || null,
      };

      const token = this.jwtService.sign(payload);
      const photoUrl = user.photoUrl || user.pilgrimProfile?.photoUrl || null;

      return {
        data: {
          user: {
            id: user.id,
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            fullName: user.fullName,
            role: user.role,
            photoUrl: photoUrl,
            agency: user.agency
              ? {
                  name: user.agency.name,
                  slug: user.agency.slug,
                  isActive: user.agency.isActive,
                }
              : null,
          },
          token,
        },
      };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Login failed',
          code: error instanceof HttpException ? error.getStatus() : 500,
        },
      };
    }
  };

  forgotPassword = async (dto: ProviderForgotPasswordDto): Promise<IUsecaseResponse<boolean>> => {
    try {
      const user = await this.repository.findByIdentifier(dto.identifier);
      if (!user) {
        return { data: true };
      }

      const rawToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await this.repository.updateResetToken(user.id, rawToken, expiresAt, user.id);

      if (user.email) {
        const resetLink = `${process.env.FRONTEND_URL || 'https://badalin.com'}${process.env.FRONTEND_PROVIDER_RESET_PASSWORD_ROUTE}?token=${rawToken}`;
        sendResetPasswordEmail(user.email, resetLink).catch((err) => {
          Logger.error('Failed to send reset password email', err.message, 'provider_auth_usecase.ts - forgotPassword');
        });
      }

      return { data: true };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Forgot password failed',
          code: 500,
        },
      };
    }
  };

  resetPassword = async (dto: ProviderResetPasswordDto): Promise<IUsecaseResponse<boolean>> => {
    try {
      const user = await this.repository.findByResetToken(dto.token);
      if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
        throw new HttpException('Invalid or expired reset token', 400);
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      await this.repository.updatePassword(user.id, hashedPassword, user.id);

      return { data: true };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Reset password failed',
          code: error instanceof HttpException ? error.getStatus() : 500,
        },
      };
    }
  };
}
