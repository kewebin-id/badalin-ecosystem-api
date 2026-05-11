import { IsNotEmpty, IsString } from 'class-validator';

export class SettleRefundDto {
  @IsString()
  @IsNotEmpty()
  file: string;
}
