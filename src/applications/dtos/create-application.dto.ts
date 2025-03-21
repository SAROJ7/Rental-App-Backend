import { ApplicationStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateApplicationDto {
  @IsDate()
  applicationDate: Date;

  @IsEnum(ApplicationStatus, {
    message: 'Status must be valid application status',
  })
  status: ApplicationStatus;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  propertyId: number;

  @IsString()
  @IsNotEmpty()
  tenantCognitoId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  message?: string;
}
