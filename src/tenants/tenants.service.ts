import { Injectable, NotFoundException } from '@nestjs/common';
import { Tenant } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}
  createTenant(createTenantDto: Omit<Tenant, 'id'>) {
    return this.prisma.tenant.create({
      data: { ...createTenantDto },
    });
  }

  async getTenant(cognitoId: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { cognitoId },
      include: {
        favorites: true,
      },
    });
    if (tenant) {
      return tenant;
    } else {
      throw new NotFoundException(`Tenant not found`);
    }
  }
}
