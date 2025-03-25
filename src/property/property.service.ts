import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Location, Prisma } from '@prisma/client';
import { wktToGeoJSON } from '@terraformer/wkt';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePropertyDto } from './dtos/create-property.dto';
import { PropertyQueryDto } from './dtos/property-query.dto';
@Injectable()
export class PropertyService {
  private s3Client: S3Client;
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: this.config.get<string>('aws_region'),
    });
  }

  async createProperty(
    createPropertyDto: CreatePropertyDto,
    photos: Array<Express.Multer.File>,
  ) {
    const {
      address,
      city,
      state,
      country,
      managerCognitoId,
      postalCode,
      ...propertyData
    } = createPropertyDto;

    const photoUrls = await Promise.all(
      photos.map(async (photo) => {
        const uploadParams = {
          Bucket: this.config.get<string>('s3_bucket_name')!,
          Key: `properties/${Date.now()}-${photo.originalname}`,
          Body: photo.buffer,
          ContentType: photo.mimetype,
        };

        const uploadResult = await new Upload({
          client: this.s3Client,
          params: uploadParams,
        }).done();

        return uploadResult.Location;
      }),
    );

    const geoCodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
      {
        street: address,
        city,
        country,
        postalcode: postalCode,
        format: 'json',
        limit: '1',
      },
    ).toString()}`;

    const geoCodingResponse = await axios.get(geoCodingUrl, {
      headers: {
        'User-Agent': 'RentalApp',
      },
    });

    const [longitude, latitude] =
      geoCodingResponse?.data[0].lon && geoCodingResponse?.data[0].lat
        ? [
            parseFloat(geoCodingResponse.data[0].lon),
            parseFloat(geoCodingResponse.data[0].lat),
          ]
        : [0, 0];

    console.log({ longitude, latitude });

    const newProperty = await this.prisma.$transaction(async (tx) => {
      const [location] = await tx.$queryRaw<Location[]>`
        INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
        VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
        RETURNING id, address, city, state, country, "postalCode", ST_asText(coordinates) as coordinates;
    `;

      const newProperty = await tx.property.create({
        data: {
          ...propertyData,
          photoUrls: photoUrls.filter((url): url is string => !!url),
          locationId: location.id,
          managerCognitoId,
        },
        include: {
          location: true,
          manager: true,
        },
      });

      return newProperty;
    });
    return newProperty;
  }

  async getProperties(propertyQueryDto: PropertyQueryDto) {
    const {
      favoriteIds,
      priceMin,
      priceMax,
      beds,
      baths,
      propertyType,
      squareFeetMax,
      squareFeetMin,
      amenities,
      availableFrom,
      latitude,
      longitude,
    } = propertyQueryDto;

    const whereConditions: Prisma.Sql[] = [];

    if (favoriteIds) {
      const favoriteIdsArray = favoriteIds.split(',').map(Number);
      whereConditions.push(
        Prisma.sql`p.id IN (${Prisma.join(favoriteIdsArray)})`,
      );
    }

    if (priceMin) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`,
      );
    }

    if (priceMax) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`,
      );
    }

    if (beds && beds !== 'any') {
      whereConditions.push(Prisma.sql`p.beds >= ${Number(beds)}`);
    }

    if (baths && baths !== 'any') {
      whereConditions.push(Prisma.sql`p.baths >= ${Number(baths)}`);
    }

    if (squareFeetMin) {
      whereConditions.push(
        Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`,
      );
    }

    if (squareFeetMax) {
      whereConditions.push(
        Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax)}`,
      );
    }

    if (propertyType && propertyType !== 'any') {
      whereConditions.push(
        Prisma.sql`p."propertyType" = ${propertyType}:: "PropertyType"`,
      );
    }

    if (amenities && amenities !== 'any') {
      const amenitiesArray = amenities.split(',');
      whereConditions.push(Prisma.sql`p.amenities @> ${amenitiesArray}`);
    }

    if (availableFrom && availableFrom !== 'any') {
      const date = new Date(availableFrom);
      if (!isNaN(date.getTime())) {
        whereConditions.push(
          Prisma.sql`EXISTS (
            SELECT 1 FROM "Lease" l 
            WHERE l."propertyId" = p.id 
            AND l."startDate" <= ${date.toISOString()})`,
        );
      }
    }

    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      const radiusInKilometers = 1000;
      const degrees = radiusInKilometers / 111;

      whereConditions.push(
        Prisma.sql`ST_DWithin(
            l.coordinates::geometry, 
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326), 
            ${degrees})`,
      );
    }

    const completeQuery = Prisma.sql`
        SELECT
            p.*,
            json_build_object(
                'id', l.id,
                'address', l.address,
                'city', l.city,
                'state', l.state, 
                'country', l.country,
                'postalCode', l."postalCode",
                'coordinates', json_build_object(
                    'longitude', ST_X(l."coordinates"::geometry),
                    'latitude', ST_Y(l."coordinates"::geometry)
                )
            ) as location
        FROM "Property" p
        JOIN "Location" l ON p."locationId" = l.id
        ${
          whereConditions.length > 0
            ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`
            : Prisma.empty
        }
    `;

    return this.prisma.$queryRaw(completeQuery);
  }

  async getProperty(id: number) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        location: true,
      },
    });

    if (property) {
      const coordinates: { coordinates: string }[] = await this.prisma
        .$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;
      const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || '');
      const longitude = geoJSON.coordinates[0];
      const latitude = geoJSON.coordinates[1];

      const propertyWithCoordinates = {
        ...property,
        location: {
          ...property.location,
          coordinates: {
            longitude,
            latitude,
          },
        },
      };

      return propertyWithCoordinates;
    }
  }
}
