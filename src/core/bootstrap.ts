import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from 'src/app.module';
import * as express from 'express';
import helmet from 'helmet';
import { validationConfig } from 'src/configs/validation.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export class Bootstrap {
  private app: NestExpressApplication;
  private configService: ConfigService;

  private readonly logger = new Logger();
  private readonly globalPrefix: string = 'v1';

  async initApp() {
    this.app = await NestFactory.create<NestExpressApplication>(AppModule);
    this.configService = this.app.get(ConfigService);
  }

  enableCors() {
    this.app.enableCors();
  }

  setupMiddleware() {
    this.app.useBodyParser('json', { limit: '10mb' });
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(helmet());
  }

  setupGlobalPrefix(globalPrefix?: string) {
    this.app.setGlobalPrefix(globalPrefix ?? this.globalPrefix);
  }

  setupGlobalPipe() {
    this.app.useGlobalPipes(validationConfig);
  }

  async startApp() {
    const port = this.configService.get<number>('port') ?? 5500;
    await this.app.listen(port);
    this.logger.log(
      `🚀 Application is running on: http://localhost:${port}/${this.globalPrefix}`,
    );
    this.logger.log(`🚀 API Docs: http://localhost:${port}/api-docs`);
    return port;
  }

  swaggerSetup() {
    const config = new DocumentBuilder()
      .setTitle('Rental App Server')
      .setDescription(
        'Rental Application For buying, selling and booking of the real estate.',
      )
      .setVersion('1.0')
      .addTag('Rental App')
      .build();

    const document = SwaggerModule.createDocument(this.app, config);
    SwaggerModule.setup('api-docs', this.app, document);
  }
}
