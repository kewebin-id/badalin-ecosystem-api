import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdminGenerateInvitationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  agencySlug?: string;

  @IsBoolean()
  @IsOptional()
  isResend?: boolean;
}
