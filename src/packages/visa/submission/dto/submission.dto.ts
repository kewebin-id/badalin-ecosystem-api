import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubmitVisaDto {
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
}
