import { IsDecimal, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateAgencySettingsDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  slug?: string;

  @IsDecimal()
  @IsOptional()
  visaPrice?: number;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  bankAccountName?: string;

  @IsString()
  @IsOptional()
  bankAccountNumber?: string;
}
