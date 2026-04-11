import { globalLogger as Logger } from '@/shared/utils';
import { clientDb } from '@/shared/utils/db';
import { User } from '@prisma/client';
import { IProviderAuthRepository } from '../ports/i-provider-auth.repository';
import { UserWithAgency } from '../ports/types';

export class PrismaProviderAuthRepository implements IProviderAuthRepository {
  private readonly db = clientDb;

  findByIdentifier = async (identifier: string): Promise<UserWithAgency | null> => {
    try {
      return await this.db.user.findFirst({
        where: {
          OR: [{ email: identifier }, { phoneNumber: identifier }],
        },
        include: { agency: true, pilgrimProfile: true },
      });
    } catch (error) {
      Logger.error('Error in findByIdentifier (Provider):', error);
      throw error;
    }
  };

  findByInvitationToken = async (token: string): Promise<User | null> => {
    try {
      return await this.db.user.findFirst({
        where: { invitationToken: token },
      });
    } catch (error) {
      Logger.error('Error in findByInvitationToken (Provider):', error);
      throw error;
    }
  };

  createInvitation = async (
    email: string,
    token: string,
    expiresAt: Date,
    agencySlug?: string,
    createdBy?: string,
  ): Promise<User> => {
    try {
      return await this.db.user.upsert({
        where: { email },
        update: {
          invitationToken: token,
          invitationExpires: expiresAt,
          agencySlug: agencySlug || null,
          updatedBy: createdBy || null,
        },
        create: {
          email,
          invitationToken: token,
          invitationExpires: expiresAt,
          agencySlug: agencySlug || null,
          password: '',
          role: 'PROVIDER',
          createdBy: createdBy || null,
          updatedBy: createdBy || null,
        },
      });
    } catch (error) {
      Logger.error('Error in createInvitation (Provider):', error);
      throw error;
    }
  };

  updateProviderAccount = async (userId: string, data: Partial<User>): Promise<User> => {
    try {
      return await this.db.user.update({
        where: { id: userId },
        data: {
          ...data,
          invitationToken: null,
          invitationExpires: null,
        },
      });
    } catch (error) {
      Logger.error('Error in updateProviderAccount (Provider):', error);
      throw error;
    }
  };

  updateResetToken = async (
    userId: string,
    token: string | null,
    expiresAt: Date | null,
    updatedBy?: string,
  ): Promise<void> => {
    try {
      await this.db.user.update({
        where: { id: userId },
        data: {
          resetPasswordToken: token,
          resetPasswordExpires: expiresAt,
          updatedBy: updatedBy || null,
        },
      });
    } catch (error) {
      Logger.error('Error in updateResetToken (Provider):', error);
      throw error;
    }
  };

  findByResetToken = async (token: string): Promise<User | null> => {
    try {
      return await this.db.user.findFirst({
        where: { resetPasswordToken: token },
      });
    } catch (error) {
      Logger.error('Error in findByResetToken (Provider):', error);
      throw error;
    }
  };

  updatePassword = async (userId: string, targetPassword: string, updatedBy?: string): Promise<void> => {
    try {
      await this.db.user.update({
        where: { id: userId },
        data: {
          password: targetPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
          updatedBy: updatedBy || null,
        },
      });
    } catch (error) {
      Logger.error('Error in updatePassword (Provider):', error);
      throw error;
    }
  };
}
