import { ISubmissionResultSnapshot } from '@/packages/visa/pilgrim/submission/domain/submission.entity';
import { VerifyStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

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
  resultSnapshot?: ISubmissionResultSnapshot;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemberReviewDto)
  members?: MemberReviewDto[];
}
