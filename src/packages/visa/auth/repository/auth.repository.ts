import { globalLogger as Logger } from '@/shared/utils';
import { clientDb } from '@/shared/utils/db';
import { User, UserRole } from '@prisma/client';
import { RegisterDto } from '../dto/auth.dto';
import { IAuthRepository, UserWithAgency } from '../ports/i.repository';

export class PrismaAuthRepository implements IAuthRepository {
  private readonly db = clientDb;

  findByIdentifier = async (identifier: string): Promise<UserWithAgency | null> => {
    try {
      return await this.db.user.findFirst({
        where: {
          OR: [{ email: identifier }, { phoneNumber: identifier }],
        },
        include: { agency: true },
      });
    } catch (error) {
      Logger.error('Error in findByIdentifier:', error);
      throw error;
    }
  };

  create = async (dto: RegisterDto, agencySlug?: string): Promise<User> => {
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
        agencySlug: agencySlug || null,
        role: UserRole.PILGRIM,
      };
      return await this.db.user.create({ data });
    } catch (error) {
      Logger.error('Error in create user:', error);
      throw error;
    }
  };

  updateResetToken = async (userId: string, token: string | null, expiresAt: Date | null): Promise<void> => {
    try {
      await this.db.user.update({
        where: { id: userId },
        data: { resetPasswordToken: token, resetPasswordExpires: expiresAt },
      });
    } catch (error) {
      Logger.error('Error in updateResetToken:', error);
      throw error;
    }
  };

  findByResetToken = async (token: string): Promise<User | null> => {
    try {
      return await this.db.user.findFirst({
        where: { resetPasswordToken: token },
      });
    } catch (error) {
      Logger.error('Error in findByResetToken:', error);
      throw error;
    }
  };

  updatePassword = async (userId: string, targetPassword: string): Promise<void> => {
    try {
      await this.db.user.update({
        where: { id: userId },
        data: {
          password: targetPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });
    } catch (error) {
      Logger.error('Error in updatePassword:', error);
      throw error;
    }
  };
}
