import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Tenant } from '@prisma/client';
import { wktToGeoJSON } from '@terraformer/wkt';
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

  async updateTenant(
    cognitoId: string,
    updateTenantDto: Partial<Omit<Tenant, 'id'>>,
  ) {
    return this.prisma.tenant.update({
      where: {
        cognitoId,
      },
      data: { ...updateTenantDto },
    });
  }

  async getCurrentResidences(cognitoId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { cognitoId },
    });

    if (!tenant) throw new NotFoundException(`Tenant Not Found`);

    const properties = await this.prisma.property.findMany({
      where: { tenants: { some: { cognitoId } } },
      include: {
        location: true,
      },
    });

    const residencesWithFormattedLocation = await Promise.all(
      properties.map(async (property) => {
        const coordinates = await this.prisma.$queryRaw<
          { coordinates: string }[]
        >`SELECT ST_asText(coordinates) as coordinates from  "Location" where id = ${property.location.id}`;

        const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates) || '';
        const longitude = geoJSON.coordinates[0];
        const latitude = geoJSON.coordinates[1];

        return {
          ...property,
          location: {
            ...property.location,
            coordinates: {
              longitude,
              latitude,
            },
          },
        };
      }),
    );
    return residencesWithFormattedLocation;
  }

  async addFavoriteProperty(cognitoId: string, propertyId: number) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { cognitoId },
      include: { favorites: true },
    });

    const existingFavorites = tenant?.favorites || [];

    if (!existingFavorites.some((fav) => fav.id === propertyId)) {
      const updatedTenant = await this.prisma.tenant.update({
        where: { cognitoId },
        data: {
          favorites: {
            connect: { id: propertyId },
          },
        },
        include: {
          favorites: true,
        },
      });

      return updatedTenant;
    } else {
      throw new ConflictException(`Property already added as favorites`);
    }
  }

  async removeFavoriteProperty(cognitoId: string, propertyId: number) {
    return this.prisma.tenant.update({
      where: { cognitoId },
      data: {
        favorites: {
          disconnect: { id: propertyId },
        },
      },
      include: {
        favorites: true,
      },
    });
  }
}
