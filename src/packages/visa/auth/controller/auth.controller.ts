import { EAuthRoutes, EVisaRoutes, validationMessage } from '@/shared/constants';
import { Body, Controller, HttpStatus, Inject, Post, Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import { response } from '@/shared/utils/rest-api/response';
import { CheckUserDto, LoginDto, RegisterDto } from '../dto/auth.dto';
import { IAuthUseCase } from '../ports/i.usecase';

@Controller(EVisaRoutes.AUTH)
export class AuthController {
  constructor(
    @Inject('IAuthUseCase')
    private readonly authUseCase: IAuthUseCase,
  ) {}

  @Post(EAuthRoutes.CHECK_USER)
  async checkUser(@Body() dto: CheckUserDto, @Res() res: Response) {
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
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    try {
      const agencySlug = res.req.cookies?.['agency_id'];
      const responseData = await this.authUseCase.register(dto, agencySlug);
      if (responseData.error) {
        return response[responseData.error.code || HttpStatus.INTERNAL_SERVER_ERROR](res, {
          message: responseData.error.message || 'Registration failed',
        });
      }
      const user = responseData.data;
      return response[HttpStatus.CREATED](res, {
        message: validationMessage('User')[201](),
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
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    try {
      const responseData = await this.authUseCase.login(dto);
      if (responseData.error) {
        return response[responseData.error.code || HttpStatus.UNAUTHORIZED](res, {
          message: responseData.error.message || 'Login failed',
        });
      }
      return response[HttpStatus.OK](res, {
        message: 'Login successful',
        data: responseData.data,
      });
    } catch (error) {
      Logger.error(error instanceof Error ? error.message : 'Error in login');
      return response[HttpStatus.UNAUTHORIZED](res, {
        message: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }
}
