import { Manager } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateManagerDto implements Omit<Manager, 'id'> {
  @IsString()
  @IsNotEmpty()
  cognitoId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  phoneNumber: string;
}
