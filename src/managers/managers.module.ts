import { Module } from '@nestjs/common';
import { ManagersService } from './managers.service';
import { ManagersController } from './manager.controller';

@Module({
  providers: [ManagersService],
  controllers: [ManagersController],
})
export class ManagersModule {}
