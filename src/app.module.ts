import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './configs/configuration';
import { TenantsModule } from './tenants/tenants.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { ManagersModule } from './managers/managers.module';
import { PropertyModule } from './property/property.module';
import { LeaseModule } from './lease/lease.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    JwtModule.register({
      global: true,
    }),
    PrismaModule,
    TenantsModule,
    ManagersModule,
    PropertyModule,
    LeaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
