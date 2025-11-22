import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  await app.listen(port);

  Logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
