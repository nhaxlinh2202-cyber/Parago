import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { Mode } from '@prisma/client';

export class CreateRideDto {
  @IsString()
  pickupLocation: string;

  @IsNumber()
  @IsOptional()
  pickupLat?: number;

  @IsNumber()
  @IsOptional()
  pickupLng?: number;

  @IsString()
  destinationLocation: string;

  @IsNumber()
  @IsOptional()
  destLat?: number;

  @IsNumber()
  @IsOptional()
  destLng?: number;

  @IsNumber()
  @IsOptional()
  distance?: number;

  @IsInt()
  @IsOptional()
  duration?: number;

  @IsDateString()
  departureAt: string;

  @IsInt()
  @Min(1)
  seatsAvailable: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  vehicleType: string;

  @IsString()
  @IsOptional()
  vehicleName?: string;

  @IsString()
  @IsOptional()
  genderPreference?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(Mode)
  mode: Mode;
}
