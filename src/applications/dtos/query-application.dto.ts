import { IsOptional, IsString } from 'class-validator';

export class QueryApplicationDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  userType?: string;
}
