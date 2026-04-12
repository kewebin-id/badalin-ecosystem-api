import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { RoomType, TransportType, HotelCity, FlightType } from '@prisma/client';

export class FlightManifestDto {
  @IsEnum(FlightType)
  @IsNotEmpty()
  type: FlightType;

  @IsString()
  @IsNotEmpty()
  flightNo: string;

  @IsString()
  @IsNotEmpty()
  carrier: string;

  @IsDateString()
  @IsNotEmpty()
  flightDate: string;

  @IsDateString()
  @IsNotEmpty()
  eta: string;

  @IsDateString()
  @IsNotEmpty()
  etd: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  imageUrls: string[];
}

export class HotelManifestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  resvNo: string;

  @IsDateString()
  @IsNotEmpty()
  checkIn: string;

  @IsDateString()
  @IsNotEmpty()
  checkOut: string;

  @IsEnum(HotelCity)
  @IsNotEmpty()
  city: HotelCity;

  @IsEnum(RoomType)
  @IsNotEmpty()
  roomType: RoomType;

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  imageUrls: string[];
}

export class TransportationManifestDto {
  @IsEnum(TransportType)
  @IsNotEmpty()
  type: TransportType;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  from?: string;

  @IsString()
  @IsOptional()
  to?: string;

  @IsInt()
  @IsNotEmpty()
  totalVehicle: number;

  @IsInt()
  @IsOptional()
  totalH?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];
}
