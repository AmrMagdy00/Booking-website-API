import { Module } from '@nestjs/common';
import { BookingsController } from './controllers/bookings/bookings.controller';
import { BookingsService } from './services/bookings/bookings.service';
import { PricingService } from './services/pricing/pricing.service';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, PricingService]
})
export class BookingsModule {}
