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
  uniformSize?: string;

  @IsString()
  @IsNotEmpty()
  photoUrl: string;

  @IsString()
  @IsNotEmpty()
  ktpUrl: string;

  @IsString()
  @IsNotEmpty()
  passportUrl: string;

  @IsNumber()
  @IsOptional()
  ocrConfidence?: number;
}

export class UpdatePilgrimDto extends CreatePilgrimDto {}
