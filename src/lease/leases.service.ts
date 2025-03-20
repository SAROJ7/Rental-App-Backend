import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LeasesService {
  constructor(private readonly prismaService: PrismaService) {}

  async getLeases() {
    return this.prismaService.lease.findMany({
      include: {
        tenant: true,
        property: true,
      },
    });
  }

  async getLeasePayment(id: number) {
    return this.prismaService.payment.findMany({
      where: { leaseId: id },
    });
  }
}
