import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ProviderLoginDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ProviderRegisterDto {
  @IsString()
  @IsNotEmpty()
  invitationToken: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;
}

export class ProviderVerifyTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ProviderForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;
}

export class ProviderResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  password: string;
}
