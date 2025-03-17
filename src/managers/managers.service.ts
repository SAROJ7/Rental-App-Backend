import { Injectable, NotFoundException } from '@nestjs/common';
import { Manager } from '@prisma/client';
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
}
