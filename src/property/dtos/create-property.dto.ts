import { Amenity, Highlight, Property, PropertyType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePropertyDto
  implements Omit<Property, 'id' | 'photoUrls' | 'postedDate' | 'locationId'>
{
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  pricePerMonth: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  securityDeposit: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  applicationFee: number;

  @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : []))
  @IsArray()
  amenities: Amenity[];

  @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : []))
  @IsArray()
  highlights: Highlight[];

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isPetsAllowed: boolean;

  @Transform(({ value }) => value === 'true')
  isParkingIncluded: boolean;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  beds: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  baths: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  squareFeet: number;

  @IsString()
  propertyType: PropertyType;

  @Transform(({ value }) => parseFloat(value))
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber()
  @IsOptional()
  averageRating: number | null;

  @Transform(({ value }) => (value ? parseInt(value) : null))
  @IsNumber()
  @IsOptional()
  numberOfReviews: number | null;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  country: string;

  @IsString()
  postalCode: string;

  @IsString()
  managerCognitoId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;
}
