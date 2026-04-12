import { IUsecaseResponse } from '@/shared/utils';
import { HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminLoginDto } from '../dto/admin-auth.dto';
import { IAdminAuthUseCase } from '../ports/admin-auth.usecase.port';
import { IProviderAuthRepository } from '@/packages/visa/provider/auth';

@Injectable()
export class AdminAuthUseCase implements IAdminAuthUseCase {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('IProviderAuthRepository')
    private readonly repository: IProviderAuthRepository,
  ) {}

  login = async (
    dto: AdminLoginDto,
  ): Promise<
    IUsecaseResponse<{
      user: {
        id: string;
        email: string;
        phoneNumber: string;
        fullName: string | null;
        role: string;
      };
      token: string;
    }>
  > => {
    try {
      const user = await this.repository.findByIdentifier(dto.identifier);

      if (!user || !(await bcrypt.compare(dto.password, user.password))) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (user.role !== 'SUPERADMIN') {
        throw new UnauthorizedException('Access denied: Unauthorized role');
      }

      const payload = {
        id: user.id,
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        role: user.role,
        agencySlug: user.agency?.slug || null,
      };

      const token = this.jwtService.sign(payload);

      return {
        data: {
          user: {
            id: user.id,
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            fullName: user.fullName,
            role: user.role,
          },
          token,
        },
      };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Login failed',
          code: error instanceof HttpException ? error.getStatus() : 500,
        },
      };
    }
  };
}
