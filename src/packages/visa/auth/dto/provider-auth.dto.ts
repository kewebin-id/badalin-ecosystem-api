import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ProviderRegisterDto {
  @IsString()
  @IsNotEmpty()
  invitationToken: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;
}

export class ProviderLoginDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  password: string;
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
  @MinLength(6)
  password: string;
}

export class ProviderVerifyTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
