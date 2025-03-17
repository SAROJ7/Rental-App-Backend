import { Tenant } from '@prisma/client';
import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';

export class CreateTenantDto implements Omit<Tenant, 'id'> {
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
