import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ManagersService } from './managers.service';
import { CreateManagerDto } from './dtos/create-manager.dto';
import { JwtGuard } from 'src/guards/jwt.guard';
import { Roles } from 'src/decorators/role.decorator';

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
}
