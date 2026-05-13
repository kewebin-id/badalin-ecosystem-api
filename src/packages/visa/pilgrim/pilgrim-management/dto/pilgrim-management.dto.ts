import { IsString, IsNotEmpty, IsOptional, IsDate, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PilgrimRelation } from '@prisma/client';

export class CreatePilgrimDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  passportNumber: string;

  @Type(() => Date)
  @IsDate()
  birthDate: Date;

  @Type(() => Date)
  @IsDate()
  passportExpiry: Date;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  maritalStatus: string;

  @IsEnum(PilgrimRelation)
  @IsNotEmpty()
  relation: PilgrimRelation;

  @IsString()
  @IsNotEmpty()
  nik: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @IsNotEmpty()
  ktpUrl: string;

  @IsString()
  @IsNotEmpty()
  passportUrl: string;

  @IsString()
  @IsOptional()
  employmentCertificateUrl?: string;

  @IsNumber()
  @IsOptional()
  ocrConfidence?: number;
}

export class UpdatePilgrimDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  passportNumber?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  birthDate?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  passportExpiry?: Date;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  maritalStatus?: string;

  @IsEnum(PilgrimRelation)
  @IsOptional()
  relation?: PilgrimRelation;

  @IsString()
  @IsOptional()
  nik?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @IsOptional()
  ktpUrl?: string;

  @IsString()
  @IsOptional()
  passportUrl?: string;

  @IsString()
  @IsOptional()
  employmentCertificateUrl?: string;

  @IsNumber()
  @IsOptional()
  ocrConfidence?: number;
}
