import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingsRepository } from './bookings.repository';
import { BookingsMapper } from './mappers/bookings.mapper';
import { BookingContactService } from './booking-contact/booking-contact.service';
import { BookingContactRepository } from './booking-contact/booking-contact.repository';

import { Booking, BookingSchema } from './schema/booking.schema';
import {
  BookingContact,
  BookingContactSchema,
} from './booking-contact/booking-contact.schema';

import { CommonModule } from '@/common/common.module';
import { PackagesModule } from '@/modules/packages/packages.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: BookingContact.name, schema: BookingContactSchema },
    ]),
    CommonModule,
    forwardRef(() => PackagesModule),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    BookingsRepository,
    BookingsMapper,
    BookingContactService,
    BookingContactRepository,
  ],
  exports: [BookingsService],
})
export class BookingsModule {}
