import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { JwtGuard } from 'src/guards/jwt.guard';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dtos/create-tenant.dto';
import { APP } from 'src/constants';
import { UpdateTenantDto } from './dtos/update-tenant.dto';

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

  @Roles('tenant')
  @Patch(':cognitoId')
  updateTenant(
    @Param('cognitoId') cognitoId: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.tenantService.updateTenant(cognitoId, updateTenantDto);
  }

  @Roles('tenant')
  @Get(':cognitoId/properties')
  getProperties(@Param('cognitoId') cognitoId: string) {
    return this.tenantService.getCurrentResidences(cognitoId);
  }

  @Roles('tenant')
  @Post(':cognitoId/favorites/:propertyId')
  addFavoriteProperty(
    @Param('cognitoId') cognitoId: string,
    @Param('propertyId') propertyId: string,
  ) {
    return this.tenantService.addFavoriteProperty(cognitoId, +propertyId);
  }

  @Roles('tenant')
  @Delete(':cognitoId/favorites/:propertyId')
  removeFavoriteProperty(
    @Param('cognitoId') cognitoId: string,
    @Param('propertyId') propertyId: string,
  ) {
    return this.tenantService.removeFavoriteProperty(cognitoId, +propertyId);
  }
}
