import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Starts listening for shutdown hooks
  // app.enableShutdownHooks();

  app.useGlobalPipes(new ValidationPipe({
    skipMissingProperties: true,
    transform: true
  }));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(
    app.get(Reflector),
    { strategy: 'excludeAll' }
  ));

  await app.listen(3000);
}

bootstrap();
