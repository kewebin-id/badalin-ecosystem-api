import { globalLogger as Logger } from '@/shared/utils';
import { clientDb } from '@/shared/utils/db';
import { User, UserRole } from '@prisma/client';
import { PilgrimRegisterDto } from '../dto/pilgrim-auth.dto';
import { IPilgrimAuthRepository } from '../ports/pilgrim-auth.repository.port';
import { UserWithAgency } from '@/packages/visa/shared/actor-types';

export class PilgrimAuthRepository implements IPilgrimAuthRepository {
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
      Logger.error('Error in findByIdentifier (Pilgrim):', error);
      throw error;
    }
  };

  create = async (dto: PilgrimRegisterDto, agencySlug?: string, createdBy?: string): Promise<User> => {
    try {
      if (agencySlug) {
        const agency = await this.db.agency.findUnique({
          where: { slug: agencySlug },
        });
        if (!agency) {
          throw new Error('Agency not found');
        }
      }

      const isEmail = dto.identifier.includes('@');
      const data = {
        email: isEmail ? dto.identifier : dto.email || null,
        phoneNumber: !isEmail ? dto.identifier : dto.phoneNumber || null,
        password: dto.password,
        fullName: dto.fullName,
        agencySlug: agencySlug || null,
        role: UserRole.PILGRIM,
        createdBy: createdBy || null,
        updatedBy: createdBy || null,
      };
      return await this.db.user.create({ data });
    } catch (error) {
      Logger.error('Error in create user (Pilgrim):', error);
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
      Logger.error('Error in updateResetToken (Pilgrim):', error);
      throw error;
    }
  };

  findByResetToken = async (token: string): Promise<User | null> => {
    try {
      return await this.db.user.findFirst({
        where: { resetPasswordToken: token },
      });
    } catch (error) {
      Logger.error('Error in findByResetToken (Pilgrim):', error);
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
      Logger.error('Error in updatePassword (Pilgrim):', error);
      throw error;
    }
  };
}
