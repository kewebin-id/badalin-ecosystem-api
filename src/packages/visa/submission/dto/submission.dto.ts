import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { RoomType } from '@prisma/client';

export class CreateVisaSubmissionDto {
  @IsString()
  @IsNotEmpty()
  agencySlug: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  pilgrimIds: string[];

  @IsDateString()
  @IsNotEmpty()
  flightEta: string;

  @IsDateString()
  @IsNotEmpty()
  flightEtd: string;

  @IsDateString()
  @IsNotEmpty()
  hotelCheckin: string;

  @IsDateString()
  @IsNotEmpty()
  hotelCheckout: string;

  @IsString()
  @IsNotEmpty()
  transportType: string;

  @IsString()
  @IsNotEmpty()
  tripRoute: string;

  @IsString()
  @IsNotEmpty()
  flightNo: string;

  @IsString()
  @IsNotEmpty()
  carrier: string;

  @IsDateString()
  @IsNotEmpty()
  flightDate: string;

  @IsString()
  @IsNotEmpty()
  hotelMakkahName: string;

  @IsString()
  @IsNotEmpty()
  hotelMadinahName: string;

  @IsString()
  @IsNotEmpty()
  hotelMakkahResvNo: string;

  @IsString()
  @IsNotEmpty()
  hotelMadinahResvNo: string;

  @IsEnum(RoomType)
  @IsNotEmpty()
  roomType: RoomType;

  @IsString()
  @IsNotEmpty()
  busCompany: string;

  @IsString()
  @IsNotEmpty()
  busTime: string;

  @IsNumber()
  @IsNotEmpty()
  totalBus: number;

  @IsDateString()
  @IsNotEmpty()
  trainDate: string;

  @IsString()
  @IsNotEmpty()
  trainFrom: string;

  @IsString()
  @IsNotEmpty()
  trainTo: string;

  @IsString()
  @IsNotEmpty()
  trainTime: string;

  @IsNumber()
  @IsNotEmpty()
  trainTotalH: number;

  @IsString()
  @IsNotEmpty()
  rawdahMenTime: string;

  @IsString()
  @IsNotEmpty()
  rawdahWomenTime: string;
}

export class UpdateVisaSubmissionDto extends CreateVisaSubmissionDto {}
