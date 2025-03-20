import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LeaseService } from './lease.service';

@Controller('lease')
@ApiTags('Lease')
export class LeaseController {
  constructor(private readonly leaseService: LeaseService) {}
}
