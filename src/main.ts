import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

/**
 * Bootstrap function - Initializes and starts the NestJS application
 * Reads port from configuration and starts the server
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('app.port', { infer: true });

  await app.listen(port);
}

bootstrap();
