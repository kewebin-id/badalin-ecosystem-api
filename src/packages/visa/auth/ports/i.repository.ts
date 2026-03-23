import { User, Prisma } from '@prisma/client';
import { CheckUserDto, RegisterDto } from '../dto/auth.dto';

export type UserWithAgency = Prisma.UserGetPayload<{ include: { agency: true } }>;

export interface IAuthRepository {
  findByIdentifier: (identifier: string) => Promise<UserWithAgency | null>;
  create: (data: RegisterDto, agencySlug?: string, createdBy?: string) => Promise<User>;
  updateResetToken: (userId: string, token: string | null, expiresAt: Date | null, updatedBy?: string) => Promise<void>;
  findByResetToken: (token: string) => Promise<User | null>;
  updatePassword: (userId: string, targetPassword: string, updatedBy?: string) => Promise<void>;
}
