import { Response } from 'express';
import { CheckUserDto, LoginDto, RegisterDto } from '../dto/auth.dto';

export interface IAuthController {
  checkUser: (dto: CheckUserDto, res: Response) => Promise<Response>;
  register: (dto: RegisterDto, res: Response) => Promise<Response>;
  login: (dto: LoginDto, res: Response) => Promise<Response>;
}
