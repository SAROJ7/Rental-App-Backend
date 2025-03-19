import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class PropertyQueryDto {
  @IsNumberString()
  @IsOptional()
  priceMin?: string;

  @IsNumberString()
  @IsOptional()
  priceMax?: string;

  @IsString()
  @IsOptional()
  favoriteIds?: string;

  @IsString()
  @IsOptional()
  beds?: string;

  @IsString()
  @IsOptional()
  baths?: string;

  @IsString()
  @IsOptional()
  propertyType?: string;

  @IsNumberString()
  @IsOptional()
  squareFeetMin?: string;

  @IsNumberString()
  @IsOptional()
  squareFeetMax?: string;

  @IsString()
  @IsOptional()
  amenities?: string;

  @IsString()
  @IsOptional()
  availableFrom?: string;

  @IsNumberString()
  @IsOptional()
  latitude?: string;

  @IsNumberString()
  @IsOptional()
  longitude?: string;
}
