import { PilgrimRelation } from '@prisma/client';
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
  @IsNotEmpty()
  maritalStatus: string;

  @IsEnum(PilgrimRelation)
  @IsNotEmpty()
  relation: PilgrimRelation;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  ocrConfidence?: number;

  @IsString()
  @IsNotEmpty()
  photoUrl: string;

  @IsString()
  @IsOptional()
  selfieUrl?: string;

  @IsString()
  @IsNotEmpty()
  ktpUrl: string;

  @IsString()
  @IsNotEmpty()
  passportUrl: string;
}

export class UpdatePilgrimDto extends CreatePilgrimDto {}
