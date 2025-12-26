import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

/**
 * Bootstrap function - Initializes and starts the NestJS application
 * Sets up global validation pipe and reads port from configuration
 */
async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Global validation pipe configuration
    // - whitelist: strips non-whitelisted properties
    // - forbidNonWhitelisted: throws error if non-whitelisted properties exist
    // - transform: automatically transforms payloads to DTO instances
    // - enableImplicitConversion: converts string numbers to numbers automatically
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Get port from configuration and start the server
    const configService = app.get(ConfigService);
    const port =
      configService.get<number>('app.port') ||
      Number(process.env.PORT) ||
      3000;

    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
  } catch (error) {
    console.error('Error starting the application:', error);
    process.exit(1);
  }
}

bootstrap();
