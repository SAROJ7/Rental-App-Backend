import { Injectable, NotFoundException } from '@nestjs/common';
import { Manager } from '@prisma/client';
import { wktToGeoJSON } from '@terraformer/wkt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ManagersService {
  constructor(private readonly prisma: PrismaService) {}
  async createManager(createManagerDto: Omit<Manager, 'id'>) {
    return this.prisma.manager.create({
      data: { ...createManagerDto },
    });
  }

  async getManager(cognitoId: string) {
    const manager = await this.prisma.manager.findUnique({
      where: { cognitoId },
    });

    if (manager) {
      return manager;
    } else {
      throw new NotFoundException(`Manager not Found.`);
    }
  }

  async updateManager(
    cognitoId: string,
    updateManagerDto: Partial<Omit<Manager, 'id'>>,
  ) {
    return this.prisma.manager.update({
      where: { cognitoId },
      data: { ...updateManagerDto },
    });
  }

  async getManagerProperties(cognitoId: string) {
    const manager = await this.prisma.manager.findUnique({
      where: { cognitoId },
    });

    if (!manager) {
      throw new NotFoundException(`Manager Not Found`);
    }

    const properties = await this.prisma.property.findMany({
      where: {
        managerCognitoId: cognitoId,
      },
      include: { location: true },
    });

    const propertiesWithFormattedLocation = await Promise.all(
      properties.map(async (property) => {
        const coordinates = await this.prisma.$queryRaw<
          { coordinates: string }[]
        >`SELECT ST_asText(coordinates) as coordinates from  "Location" where id = ${property.location.id}`;

        const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || '');
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

    return propertiesWithFormattedLocation;
  }
}
