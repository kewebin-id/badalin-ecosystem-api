import { IUsecaseResponse, globalLogger as Logger, sendInvitationEmail } from '@/shared/utils';
import { HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import dayjs from 'dayjs';
import { AdminGenerateInvitationDto, AdminLoginDto } from '../dto/admin-auth.dto';
import { IAdminAuthUseCase } from '../ports/i-admin-auth.usecase';
import { IProviderAuthRepository } from '../ports/i-provider-auth.repository';

@Injectable()
export class AdminAuthUseCase implements IAdminAuthUseCase {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('IProviderAuthRepository')
    private readonly repository: IProviderAuthRepository,
  ) {}

  generateInvitation = async (
    dto: AdminGenerateInvitationDto,
    adminId?: string,
  ): Promise<IUsecaseResponse<boolean>> => {
    try {
      const existingUser = await this.repository.findByIdentifier(dto.email);

      if (existingUser && existingUser.role === 'PROVIDER') {
        const isFullAccount = existingUser.password !== '';
        if (!dto.isResend || isFullAccount) {
          throw new HttpException('A provider account with this email already exists', HttpStatus.CONFLICT);
        }
      }

      let token: string = crypto.randomUUID();
      const expiryHours = parseInt(process.env.INVITATION_EXPIRY_HOURS || '3', 10);
      let expiresAt: Date = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

      const hasValidToken =
        existingUser?.invitationToken &&
        existingUser?.invitationExpires &&
        new Date(existingUser.invitationExpires) > new Date();

      if (hasValidToken) {
        token = existingUser.invitationToken!;
        expiresAt = new Date(existingUser.invitationExpires!);
      } else {
        await this.repository.createInvitation(dto.email, token, expiresAt, dto.agencySlug, adminId);
      }

      const formattedExpiry = dayjs(expiresAt).format('dddd, MMMM D, YYYY HH:mm') + ' WIB';

      const invitationLink = `${process.env.FRONTEND_URL || 'https://badalin.com'}${process.env.FRONTEND_PROVIDER_REGISTRATION}?token=${token}`;
      sendInvitationEmail(dto.email, invitationLink, formattedExpiry).catch((err) => {
        Logger.error('Failed to send invitation email', err.message, 'admin-auth.usecase.ts - generateInvitation');
      });

      return { data: true };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Failed to generate invitation',
          code: error instanceof HttpException ? error.getStatus() : 500,
        },
      };
    }
  };

  login = async (
    dto: AdminLoginDto,
  ): Promise<
    IUsecaseResponse<{
      user: {
        id: string;
        email: string;
        phoneNumber: string;
        fullName: string | null;
        role: string;
      };
      token: string;
    }>
  > => {
    try {
      const user = await this.repository.findByIdentifier(dto.identifier);

      if (!user || !(await bcrypt.compare(dto.password, user.password))) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (user.role !== 'SUPERADMIN') {
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

      return {
        data: {
          user: {
            id: user.id,
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            fullName: user.fullName,
            role: user.role,
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
}
