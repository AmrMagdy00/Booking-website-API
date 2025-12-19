import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';

import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { QueryBookingDto } from './dtos/query-booking.dto';
import { ResponseService } from '@/shared/services/response/response.service';
import { UpdateBookingDto } from './dtos/update-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // Admins || Auth User get only related bookings
  @Get()
  async getBookings(@Query() queryDto: QueryBookingDto) {
    const result = await this.bookingsService.findAll(queryDto);
    return ResponseService.paginatedResponse(result.items, result.meta);
  }

  // Admins || Auth User get only related bookings
  @Get(':id')
  async getBookingById(@Param('id') id: string) {
    const bookingDetail = await this.bookingsService.findById(id);
    return ResponseService.successResponse(
      bookingDetail,
      'Booking retrieved successfully',
    );
  }

  // Users && Guests
  @Post()
  async createBooking(@Body() dto: CreateBookingDto) {
    const bookingDetail = await this.bookingsService.create(dto);
    return ResponseService.successResponse(
      bookingDetail,
      'Booking created successfully',
    );
  }

  // Admins && users only related bookings
  @Patch(':id')
  async updateBooking(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
    const bookingDetail = await this.bookingsService.update(id, dto);
    return ResponseService.successResponse(
      bookingDetail,
      'Booking updated successfully',
    );
  }
  // Admins Only (Hard Deleted)
  @Delete(':id')
  async deleteBooking(@Param('id') id: string) {
    const result = await this.bookingsService.delete(id);
    return ResponseService.successResponse(result, result.message);
  }
}
