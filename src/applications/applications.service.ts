import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async listApplications(userId?: string, userType?: string) {
    let whereClause = {};

    if (userId && userType) {
      if (userType === 'tenant') {
        whereClause = { tenantCognitoId: userId };
      } else if (userType === 'manager') {
        whereClause = { property: { managerCognitoId: userId } };
      }

      const applications = await this.prismaService.application.findMany({
        where: whereClause,
        include: {
          property: {
            include: {
              location: true,
              manager: true,
            },
          },
          tenant: true,
        },
      });

      return Promise.all(
        applications.map(async (app) => {
          const lease = await this.prismaService.lease.findFirst({
            where: {
              tenant: {
                cognitoId: app.tenantCognitoId,
              },
              propertyId: app.propertyId,
            },
            orderBy: {
              startDate: 'desc',
            },
          });
          return {
            ...app,
            property: {
              ...app.property,
              address: app.property.location.address,
            },
            manager: app.property.manager,
            lease: lease
              ? {
                  ...lease,
                  nextPayment: this.calculateNextPaymentDate(lease.startDate),
                }
              : null,
          };
        }),
      );
    }
  }

  async createApplications(createApplicationDto: CreateApplicationDto) {
    const {
      applicationDate,
      status,
      propertyId,
      email,
      name,
      phoneNumber,
      tenantCognitoId,
      message,
    } = createApplicationDto;

    const property = await this.prismaService.property.findUnique({
      where: { id: propertyId },
      select: { pricePerMonth: true, securityDeposit: true },
    });

    if (!property) throw new NotFoundException(`Property not found`);

    const newApplication = await this.prismaService.$transaction(async (tx) => {
      const lease = await tx.lease.create({
        data: {
          startDate: new Date(),
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1),
          ),
          rent: property.pricePerMonth,
          deposit: property.securityDeposit,
          property: {
            connect: { id: propertyId },
          },
          tenant: {
            connect: { cognitoId: tenantCognitoId },
          },
        },
      });

      return tx.application.create({
        data: {
          applicationDate: new Date(applicationDate),
          status,
          name,
          email,
          phoneNumber,
          message,
          property: {
            connect: { id: propertyId },
          },
          tenant: {
            connect: { cognitoId: tenantCognitoId },
          },
          lease: {
            connect: { id: lease.id },
          },
        },
      });
    });

    return newApplication;
  }

  async updateApplicationStatus(id: number, status: ApplicationStatus) {
    const application = await this.prismaService.application.findUnique({
      where: { id },
      include: {
        property: true,
        tenant: true,
      },
    });

    if (!application) throw new NotFoundException(`Application not found`);

    if (status === 'Approved') {
      const newLease = await this.prismaService.lease.create({
        data: {
          startDate: new Date(),
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1),
          ),
          rent: application.property.pricePerMonth,
          deposit: application.property.securityDeposit,
          propertyId: application.propertyId,
          tenantCognitoId: application.tenantCognitoId,
        },
      });

      await this.prismaService.property.update({
        where: {
          id: application.propertyId,
        },
        data: {
          tenants: {
            connect: {
              cognitoId: application.tenantCognitoId,
            },
          },
        },
      });

      await this.prismaService.application.update({
        where: {
          id,
        },
        data: {
          status,
          leaseId: newLease.id,
        },
      });
    } else {
      await this.prismaService.application.update({
        where: { id },
        data: { status },
      });
    }

    return this.prismaService.application.findUnique({
      where: { id },
      include: {
        property: true,
        tenant: true,
        lease: true,
      },
    });
  }

  private calculateNextPaymentDate(startDate: Date): Date {
    const today = new Date();
    const nextPaymentDate = new Date(startDate);

    while (nextPaymentDate <= today) {
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 1);
    }
    return nextPaymentDate;
  }
}
