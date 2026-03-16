import { User } from '@prisma/client';
import { CheckUserDto, RegisterDto } from '../dto/auth.dto';

export interface IAuthRepository {
  findByIdentifier: (identifier: string) => Promise<any>;
  create: (data: RegisterDto, agencySlug?: string) => Promise<User>;
}
