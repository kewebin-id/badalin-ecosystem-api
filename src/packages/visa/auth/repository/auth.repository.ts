import { globalLogger as Logger } from '@/shared/utils';
import { clientDb } from '@/shared/utils/db';
import { User, UserRole } from '@prisma/client';
import { RegisterDto } from '../dto/auth.dto';
import { IAuthRepository } from '../ports/i.repository';

export class PrismaAuthRepository implements IAuthRepository {
  private readonly db = clientDb;

  findByIdentifier = async (identifier: string): Promise<User | null> => {
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
      const isEmail = dto.identifier.includes('@');
      const data = {
        email: isEmail ? dto.identifier : dto.email || null,
        phoneNumber: !isEmail ? dto.identifier : dto.phoneNumber || null,
        password: dto.password,
        agencySlug: agencySlug || null,
        role: UserRole.PILGRIM,
      };
      return await this.db.user.create({ data: data as any });

    } catch (error) {
      Logger.error('Error in create user:', error);
      throw error;
    }
  };

}
