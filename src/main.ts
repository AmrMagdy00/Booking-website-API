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

    // CORS configuration - Allow frontend to access the API
    const configService = app.get(ConfigService);

    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Always allow localhost:3000
        if (origin === 'http://localhost:3000') {
          return callback(null, true);
        }

        // Allow any HTTPS origin (including https://egyptgo.vercel.app/)
        if (origin.startsWith('https://')) {
          return callback(null, true);
        }

        // Reject other origins
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      exposedHeaders: ['Authorization'],
    });

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
    const port =
      configService.get<number>('app.port') || Number(process.env.PORT) || 3000;

    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`CORS enabled for: localhost:3000 and all HTTPS origins`);
  } catch (error) {
    console.error('Error starting the application:', error);
    process.exit(1);
  }
}

bootstrap();
