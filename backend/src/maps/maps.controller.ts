import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { MapsService } from './maps.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { IsNumber, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class EstimateRouteDto {
  @IsNumber()
  @IsNotEmpty()
  originLat: number;

  @IsNumber()
  @IsNotEmpty()
  originLng: number;

  @IsNumber()
  @IsNotEmpty()
  destLat: number;

  @IsNumber()
  @IsNotEmpty()
  destLng: number;
}

export class AutocompleteDto {
  @IsString()
  @IsNotEmpty()
  input: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}

export class GeocodeDto {
  @IsString()
  @IsNotEmpty()
  placeId: string;
}

export class ReverseGeocodeDto {
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  lng: number;
}

@UseGuards(JwtAuthGuard)
@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('estimate-route')
  async estimateRoute(@Body() body: EstimateRouteDto) {
    return this.mapsService.estimateRoute(
      body.originLat,
      body.originLng,
      body.destLat,
      body.destLng
    );
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('autocomplete')
  async autocomplete(@Body() body: AutocompleteDto) {
    return this.mapsService.autocomplete(body.input, body.lat, body.lng);
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('geocode')
  async geocode(@Body() body: GeocodeDto) {
    return this.mapsService.geocode(body.placeId);
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('reverse-geocode')
  async reverseGeocode(@Body() body: ReverseGeocodeDto) {
    return this.mapsService.reverseGeocode(body.lat, body.lng);
  }
}
