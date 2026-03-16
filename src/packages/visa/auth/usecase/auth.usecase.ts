import { IUsecaseResponse } from '@/shared/utils';
import { ConflictException, HttpException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CheckUserDto, LoginDto, RegisterDto } from '../dto/auth.dto';
import { IAuthRepository } from '../ports/i.repository';
import { IAuthUseCase } from '../ports/i.usecase';

@Injectable()
export class AuthUseCase implements IAuthUseCase {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('IAuthRepository')
    private readonly repository: IAuthRepository,
  ) {}

  checkUser = async (dto: CheckUserDto): Promise<IUsecaseResponse<boolean>> => {
    try {
      const user = await this.repository.findByIdentifier(dto.identifier);
      return { data: !!user };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Failed to check user',
          code: error instanceof HttpException ? error.getStatus() : 500,
        },
      };
    }
  };

  register = async (dto: RegisterDto, agencySlug?: string): Promise<IUsecaseResponse<User>> => {
    try {
      const existingUser = await this.repository.findByIdentifier(dto.identifier);

      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = await this.repository.create(
        {
          ...dto,
          password: hashedPassword,
        },
        agencySlug || process.env.DEFAULT_AGENCY,
      );
      return { data: user };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Registration failed',
          code: error instanceof HttpException ? error.getStatus() : 500,
        },
      };
    }
  };

  login = async (
    dto: LoginDto,
  ): Promise<
    IUsecaseResponse<{
      user: {
        id: string;
        email: string;
        phoneNumber: string;
        agency: {
          name: string;
          slug: string;
          isActive: boolean;
        } | null;
      };
      token: string;
    }>
  > => {
    try {
      const user = await this.repository.findByIdentifier(dto.identifier);

      if (!user || !(await bcrypt.compare(dto.password, user.password))) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        id: user.id,
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        role: user.role,
      };

      const token = this.jwtService.sign(payload);

      return {
        data: {
          user: {
            id: user.id,
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            agency: user.agency
              ? {
                  name: user.agency.name,
                  slug: user.agency.slug,
                  isActive: user.agency.isActive,
                }
              : null,
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
