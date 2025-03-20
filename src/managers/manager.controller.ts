import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ManagersService } from './managers.service';
import { CreateManagerDto } from './dtos/create-manager.dto';
import { JwtGuard } from 'src/guards/jwt.guard';
import { Roles } from 'src/decorators/role.decorator';
import { UpdateManagerDto } from './dtos/update-manager.dto';

@ApiTags('Managers')
@UseGuards(JwtGuard)
@Controller('managers')
export class ManagersController {
  constructor(private readonly managerService: ManagersService) {}

  @Roles('manager')
  @Post('')
  createManager(@Body() createManagerDto: CreateManagerDto) {
    return this.managerService.createManager(createManagerDto);
  }

  @Roles('manager')
  @Get(':cognitoId')
  getManager(@Param('cognitoId') cognitoId: string) {
    return this.managerService.getManager(cognitoId);
  }

  @Roles('manager')
  @Patch(':cognitoId')
  updateManager(
    @Param('cognitoId') cognitoId: string,
    @Body() updateManagerDto: UpdateManagerDto,
  ) {
    return this.managerService.updateManager(cognitoId, updateManagerDto);
  }

  @Roles('manager')
  @Get(':cognitoId/properties')
  getProperties(@Param('cognitoId') cognitoId: string) {
    return this.managerService.getManagerProperties(cognitoId);
  }
}
