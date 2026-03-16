import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePilgrimDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  passportNumber: string;

  @IsDateString()
  @IsNotEmpty()
  dob: string;

  @IsDateString()
  @IsNotEmpty()
  passportExpiry: string;

  @IsString()
  @IsNotEmpty()
  nik: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsOptional()
  maritalStatus?: string;

  @IsString()
  @IsNotEmpty()
  relation: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  ocrConfidence?: number;
}

export class UpdatePilgrimDto extends CreatePilgrimDto {}
