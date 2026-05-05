import { User } from '@prisma/client';
import { UserWithAgency } from '@/packages/visa/shared/actor-types';

export interface IProviderAuthRepository {
  findByIdentifier: (identifier: string) => Promise<UserWithAgency | null>;
  findByInvitationToken: (token: string) => Promise<User | null>;
  createInvitation: (
    email: string,
    token: string,
    expiresAt: Date,
    agencySlug?: string,
    createdBy?: string,
  ) => Promise<User>;
  updateProviderAccount: (userId: string, data: Partial<User>) => Promise<User>;
  updateResetToken: (userId: string, token: string | null, expiresAt: Date | null, updatedBy?: string) => Promise<void>;
  findByResetToken: (token: string) => Promise<User | null>;
  updatePassword: (userId: string, targetPassword: string, updatedBy?: string) => Promise<void>;
  updateAgencySlug: (userId: string, agencySlug: string) => Promise<void>;
}
