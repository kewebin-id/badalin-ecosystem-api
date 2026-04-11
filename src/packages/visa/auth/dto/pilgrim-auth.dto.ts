import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class PilgrimCheckUserDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;
}

export class PilgrimRegisterDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

export class PilgrimLoginDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class PilgrimForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;
}

export class PilgrimVerifyResetTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class PilgrimResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
