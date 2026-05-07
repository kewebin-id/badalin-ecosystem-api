import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VerifyStatus } from '@prisma/client';

export class ReviewSubmissionDto {
  @IsEnum(VerifyStatus)
  @IsNotEmpty()
  status: VerifyStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
  @IsOptional()
  resultSnapshot?: any;
}
