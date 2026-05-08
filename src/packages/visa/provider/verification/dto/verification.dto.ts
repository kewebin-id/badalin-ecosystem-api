import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { VerifyStatus } from '@prisma/client';

export class MemberReviewDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsBoolean()
  isEligible: boolean;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

export class ReviewSubmissionDto {
  @IsEnum(VerifyStatus)
  @IsNotEmpty()
  status: VerifyStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @IsOptional()
  resultSnapshot?: any;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemberReviewDto)
  members?: MemberReviewDto[];
}
