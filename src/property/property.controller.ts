import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { JwtGuard } from 'src/guards/jwt.guard';
import { Roles } from 'src/decorators/role.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreatePropertyDto } from './dtos/create-property.dto';
import { PropertyQueryDto } from './dtos/property-query.dto';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post('')
  @Roles('manager')
  @UseGuards(JwtGuard)
  @UseInterceptors(FilesInterceptor('photos'))
  createProperty(
    @UploadedFiles() photos: Array<Express.Multer.File>,
    @Body() createPropertyDto: CreatePropertyDto,
  ) {
    return this.propertyService.createProperty(createPropertyDto, photos);
  }

  @Get()
  getProperties(@Query() propertyQueryDto: PropertyQueryDto) {
    return this.propertyService.getProperties(propertyQueryDto);
  }

  @Get(':id')
  getProperty(@Param('id') id: string) {
    return this.propertyService.getProperty(+id);
  }

  @Get(':id/leases')
  @Roles('manager')
  getPropertyLeases(@Param('id') id: string) {
    return this.propertyService.getPropertyLeases(+id);
  }
}
