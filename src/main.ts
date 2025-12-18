import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

/**
 * Bootstrap function - Initializes and starts the NestJS application
 * Sets up global validation pipe and reads port from configuration
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get('app.port', { infer: true }) || process.env.PORT || 3000;

  await app.listen(port);
}

bootstrap();
