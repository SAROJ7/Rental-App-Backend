import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LeasesService } from './leases.service';
import { JwtGuard } from 'src/guards/jwt.guard';
import { Roles } from 'src/decorators/role.decorator';

@Controller('leases')
@ApiTags('Lease')
@UseGuards(JwtGuard)
export class LeasesController {
  constructor(private readonly leaseService: LeasesService) {}

  @Get()
  @Roles('manager', 'tenant')
  getLeases() {
    return this.leaseService.getLeases();
  }

  @Get(':id/payments')
  @Roles('manager', 'tenant')
  getLeasePayment(@Param('id') id: string) {
    return this.leaseService.getLeasePayment(+id);
  }
}
