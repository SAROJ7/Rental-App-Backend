import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { JwtGuard } from 'src/guards/jwt.guard';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dtos/create-tenant.dto';
import { APP } from 'src/constants';

@ApiTags('Tenants')
@ApiBearerAuth(APP.JWT_BEARER)
@UseGuards(JwtGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantService: TenantsService) {}

  @Roles('tenant')
  @Post('')
  createTenant(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.createTenant(createTenantDto);
  }

  @Roles('tenant')
  @Get(':cognitoId')
  getTenant(@Param('cognitoId') cognitoId: string) {
    return this.tenantService.getTenant(cognitoId);
  }
}
