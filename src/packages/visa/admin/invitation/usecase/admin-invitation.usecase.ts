import { IUsecaseResponse, globalLogger as Logger, sendInvitationEmail } from '@/shared/utils';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import dayjs from 'dayjs';
import { AdminGenerateInvitationDto } from '../dto/admin-invitation.dto';
import { IAdminInvitationUseCase } from '../ports/admin-invitation.usecase.port';
import { IProviderAuthRepository } from '@/packages/visa/provider/auth';

@Injectable()
export class AdminInvitationUseCase implements IAdminInvitationUseCase {
  constructor(
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
        Logger.error('Failed to send invitation email', err.message, 'admin-invitation.usecase.ts - generateInvitation');
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
}
