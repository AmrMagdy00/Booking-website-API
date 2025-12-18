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
import { CloudinaryModule } from './shared/modules/cloudinary.module';
@Module({
  imports: [
    AppConfigModule,
    CloudinaryModule,
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
  providers: [AppService],
})
export class AppModule {}
