import { EAuthRoutes, EVisaRoutes } from '@/shared/constants';
import { response } from '@/shared/utils/rest-api/response';
import { Body, Controller, HttpStatus, Inject, Logger, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import {
  PilgrimCheckUserDto,
  PilgrimForgotPasswordDto,
  PilgrimLoginDto,
  PilgrimRegisterDto,
  PilgrimResetPasswordDto,
  PilgrimVerifyResetTokenDto,
} from '../dto/pilgrim-auth.dto';
import { IPilgrimAuthUseCase } from '../ports/pilgrim-auth.usecase.port';

@Controller(EVisaRoutes.PILGRIM_AUTH)
export class PilgrimAuthController {
  constructor(
    @Inject('IPilgrimAuthUseCase')
    private readonly authUseCase: IPilgrimAuthUseCase,
  ) {}

  @Post(EAuthRoutes.CHECK_USER)
  async checkUser(@Body() dto: PilgrimCheckUserDto, @Res() res: Response) {
    try {
      const responseData = await this.authUseCase.checkUser(dto);
      if (responseData.error) {
        return response[responseData.error.code || HttpStatus.INTERNAL_SERVER_ERROR](res, {
          message: responseData.error.message || 'Failed to check user',
        });
      }
      return response[HttpStatus.OK](res, {
        message: 'Success check user',
        data: { exists: responseData.data },
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error in checkUser');
      return response[HttpStatus.INTERNAL_SERVER_ERROR](res, {
        message: 'Failed to check user',
      });
    }
  }

  @Post(EAuthRoutes.REGISTER)
  async register(@Body() dto: PilgrimRegisterDto, @Res() res: Response) {
    try {
      const agencySlug = res.req.cookies?.['agency_id'] || res.req.cookies?.['agency_slug'];
      const responseData = await this.authUseCase.register(dto, agencySlug);
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
  async login(@Body() dto: PilgrimLoginDto, @Res() res: Response) {
    try {
      const responseData = await this.authUseCase.login(dto);
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
  async forgotPassword(@Body() dto: PilgrimForgotPasswordDto, @Res() res: Response) {
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

  @Post(EAuthRoutes.VERIFY_RESET_TOKEN)
  async verifyResetToken(@Body() dto: PilgrimVerifyResetTokenDto, @Res() res: Response) {
    try {
      const responseData = await this.authUseCase.verifyResetToken(dto);
      if (responseData.error) {
        return response[responseData.error.code || HttpStatus.BAD_REQUEST](res, {
          message: responseData.error.message || 'Invalid or expired token',
        });
      }
      return response[HttpStatus.OK](res, {
        message: 'Token is valid',
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error in verifyResetToken');
      return response[HttpStatus.BAD_REQUEST](res, {
        message: 'Invalid or expired token',
      });
    }
  }

  @Post(EAuthRoutes.RESET_PASSWORD)
  async resetPassword(@Body() dto: PilgrimResetPasswordDto, @Res() res: Response) {
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
