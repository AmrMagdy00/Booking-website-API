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
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:5173',
          'http://localhost:4200',
          'http://localhost:8080',
        ];

    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // In development, allow all localhost origins
        if (isDevelopment) {
          if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            return callback(null, true);
          }
        }

        // Check if origin is in allowed list
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
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
      configService.get<number>('app.port') ||
      Number(process.env.PORT) ||
      3000;

    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
  } catch (error) {
    console.error('Error starting the application:', error);
    process.exit(1);
  }
}

bootstrap();
