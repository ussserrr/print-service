import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { config } from './config/app.config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: process.env.NODE_ENV === 'development'
  });
  app.setGlobalPrefix(config.urlPrefix);

  app.useGlobalPipes(new ValidationPipe({
    skipMissingProperties: true,
    transform: true
  }));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(
    app.get(Reflector),
    { strategy: 'excludeAll' }
  ));

  await app.listen(config.port);
}

bootstrap();
