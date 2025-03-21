import {
  Controller,
  Query,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { QueryApplicationDto } from './dtos/query-application.dto';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { UpdateApplicationDto } from './dtos/update-application.dto';
import { JwtGuard } from 'src/guards/jwt.guard';
import { Roles } from 'src/decorators/role.decorator';

@Controller('applications')
@ApiTags('Applications')
@UseGuards(JwtGuard)
export class ApplicationsController {
  constructor(private readonly applicationService: ApplicationsService) {}

  @Get()
  @Roles('manager', 'tenant')
  findAll(@Query() queryApplicationDto: QueryApplicationDto) {
    return this.applicationService.listApplications(
      queryApplicationDto.userId,
      queryApplicationDto.userType,
    );
  }

  @Post()
  @Roles('tenant')
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationService.createApplications(createApplicationDto);
  }

  @Patch(':id')
  @Roles('manager')
  update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    return this.applicationService.updateApplicationStatus(
      +id,
      updateApplicationDto.status!,
    );
  }
}
