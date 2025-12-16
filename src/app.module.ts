import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { DestinationsModule } from './features/destinations/destinations.module';
import { TripsModule } from './features/trips/trips.module';
import { BookingsModule } from './features/bookings/bookings.module';
import { BookingsModule } from './bookings/bookings.module';
import { BookingsModule } from './src/features/bookings/bookings.module';
import { BookingsModule } from './src/features/bookings/bookings.module';

@Module({
  imports: [ConfigModule, DatabaseModule, CommonModule, AuthModule, UsersModule, DestinationsModule, TripsModule, BookingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
