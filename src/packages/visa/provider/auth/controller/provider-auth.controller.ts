import { EAuthRoutes, EVisaRoutes } from '@/shared/constants';
import { response } from '@/shared/utils/rest-api/response';
import { Body, Controller, HttpStatus, Inject, Logger, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { SlugGuard } from '@/shared/guards/slug.guard';
import { ReservedWordGuard } from '@/shared/guards/reserved-word.guard';
import {
  ProviderForgotPasswordDto,
  ProviderLoginDto,
  ProviderRegisterDto,
  ProviderResetPasswordDto,
  ProviderVerifyTokenDto,
} from '../dto/provider-auth.dto';
import { IProviderAuthUseCase } from '../ports/provider-auth.usecase.port';

@Controller(EVisaRoutes.PROVIDER_AUTH)
@UseGuards(SlugGuard, ReservedWordGuard)
export class ProviderAuthController {
  constructor(
    @Inject('IProviderAuthUseCase')
    private readonly authUseCase: IProviderAuthUseCase,
  ) {}

  @Post(EAuthRoutes.VERIFY_INVITATION_TOKEN)
  async verifyToken(@Body() dto: ProviderVerifyTokenDto, @Res() res: Response) {
    try {
      const responseData = await this.authUseCase.verifyInvitationToken(dto.token);
      if (responseData.error) {
        return response[responseData.error.code || HttpStatus.BAD_REQUEST](res, {
          message: responseData.error.message || 'Token verification failed',
        });
      }
      return response[HttpStatus.OK](res, {
        message: 'Token is valid',
        data: responseData.data,
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error in verifyToken');
      return response[HttpStatus.BAD_REQUEST](res, {
        message: 'Token verification failed',
      });
    }
  }

  @Post(EAuthRoutes.REGISTER)
  async register(@Body() dto: ProviderRegisterDto, @Res() res: Response) {
    try {
      const responseData = await this.authUseCase.register(dto);
      if (responseData.error) {
        return response[responseData.error.code || HttpStatus.INTERNAL_SERVER_ERROR](res, {
          message: responseData.error.message || 'Registration failed',
        });
      }
      const user = responseData.data;
      return response[HttpStatus.CREATED](res, {
        message: 'Registration successful. Welcome to Badalin Ecosystem',
        data: { id: user?.id, email: user?.email },
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error in register');
      return response[HttpStatus.INTERNAL_SERVER_ERROR](res, {
        message: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  }

  @Post(EAuthRoutes.LOGIN)
  async login(@Body() dto: ProviderLoginDto, @Res() res: Response) {
    try {
      const responseData = await this.authUseCase.login(dto, true);
      if (responseData.error) {
        return response[responseData.error.code || HttpStatus.UNAUTHORIZED](res, {
          message: responseData.error.message || 'Login failed',
        });
      }
      return response[HttpStatus.OK](res, {
        message: 'Login successful. Welcome back to Badalin Ecosystem',
        data: responseData.data,
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error in login');
      return response[HttpStatus.UNAUTHORIZED](res, {
        message: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }

  @Post(EAuthRoutes.FORGOT_PASSWORD)
  async forgotPassword(@Body() dto: ProviderForgotPasswordDto, @Res() res: Response) {
    try {
      const responseData = await this.authUseCase.forgotPassword(dto);
      if (responseData.error) {
        return response[responseData.error.code || HttpStatus.INTERNAL_SERVER_ERROR](res, {
          message: responseData.error.message || 'Forgot password failed',
        });
      }
      return response[HttpStatus.OK](res, {
        message: 'Password reset link sent successfully',
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error in forgotPassword');
      return response[HttpStatus.INTERNAL_SERVER_ERROR](res, {
        message: 'Forgot password failed',
      });
    }
  }

  @Post(EAuthRoutes.RESET_PASSWORD)
  async resetPassword(@Body() dto: ProviderResetPasswordDto, @Res() res: Response) {
    try {
      const responseData = await this.authUseCase.resetPassword(dto);
      if (responseData.error) {
        return response[responseData.error.code || HttpStatus.BAD_REQUEST](res, {
          message: responseData.error.message || 'Reset password failed',
        });
      }
      return response[HttpStatus.OK](res, {
        message: 'Password reset successfully',
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error in resetPassword');
      return response[HttpStatus.BAD_REQUEST](res, {
        message: 'Reset password failed',
      });
    }
  }
}
