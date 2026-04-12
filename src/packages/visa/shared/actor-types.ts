import { Prisma } from '@prisma/client';

export type UserWithAgency = Prisma.UserGetPayload<{
  include: { agency: true; pilgrimProfile: true };
}>;
