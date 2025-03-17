import { Manager } from '@prisma/client';
import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';

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
  @IsEmpty()
  phoneNumber: string;
}
