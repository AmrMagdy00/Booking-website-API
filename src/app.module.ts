import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AppConfigModule } from '@/config/config.module';
import { DatabaseModule } from '@/database/database.module';
import { CommonModule } from '@/common/common.module';
import { AuthModule } from '@/features/auth/auth.module';
import { UsersModule } from '@/features/users/users.module';
import { DestinationsModule } from '@/features/destinations/destinations.module';
import { TripsModule } from '@/features/trips/trips.module';
import { BookingsModule } from '@/features/bookings/bookings.module';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

/**
 * AppModule - Root module of the application
 * Registers LoggingInterceptor globally to log all HTTP requests
 */
@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('database.uri'),
      }),
    }),
    DatabaseModule,
    CommonModule,
    AuthModule,
    UsersModule,
    DestinationsModule,
    TripsModule,
    BookingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
