import { User } from '@prisma/client';
import { PilgrimRegisterDto } from '../dto/pilgrim-auth.dto';
import { UserWithAgency } from '@/packages/visa/shared/actor-types';

export interface IPilgrimAuthRepository {
  findByIdentifier: (identifier: string) => Promise<UserWithAgency | null>;
  create: (data: PilgrimRegisterDto, agencySlug?: string, createdBy?: string) => Promise<User>;
  updateResetToken: (userId: string, token: string | null, expiresAt: Date | null, updatedBy?: string) => Promise<void>;
  findByResetToken: (token: string) => Promise<User | null>;
  updatePassword: (userId: string, targetPassword: string, updatedBy?: string) => Promise<void>;
}
