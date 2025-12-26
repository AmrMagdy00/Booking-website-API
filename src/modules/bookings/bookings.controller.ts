import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';

import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { QueryBookingDto } from './dtos/query-booking.dto';
import { ResponseService } from '@/shared/services/response/response.service';
import { UpdateBookingDto } from './dtos/update-booking.dto';
import { AuthRolesGuard } from '@/common/guards/auth/auth.guard';
import { Roles } from '@/common/auth/decorators/roles.decorator';
import { UserRole } from '@/modules/users/enums/user-role.enum';
import { CurrentUser } from '@/common/decorators/current-user/current-user.decorator';
import { JWTPayloadType } from '@/common/auth/types/jwt-payload.type';

@Controller('bookings')
@UseGuards(AuthRolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // Admins || Auth User get only related bookings
  @Get()
  async getBookings(
    @Query() queryDto: QueryBookingDto,
    @CurrentUser() user: JWTPayloadType,
  ) {
    const result = await this.bookingsService.findAll(queryDto, user);
    return ResponseService.paginatedResponse(result.items, result.meta);
  }

  // Admins || Auth User get only related bookings
  @Get(':id')
  async getBookingById(
    @Param('id') id: string,
    @CurrentUser() user: JWTPayloadType,
  ) {
    const bookingDetail = await this.bookingsService.findById(id, user);
    return ResponseService.successResponse(
      bookingDetail,
      'Booking retrieved successfully',
    );
  }

  // Admins || Auth User get only related bookings
  @Post()
  async createBooking(
    @Body() dto: CreateBookingDto,
    @CurrentUser() user: JWTPayloadType,
  ) {
    const bookingDetail = await this.bookingsService.create(dto, user);
    return ResponseService.successResponse(
      bookingDetail,
      'Booking created successfully',
    );
  }

  // Admins && users only related bookings
  @Patch(':id')
  async updateBooking(
    @Param('id') id: string,
    @Body() dto: UpdateBookingDto,
    @CurrentUser() user: JWTPayloadType,
  ) {
    const bookingDetail = await this.bookingsService.update(id, dto, user);
    return ResponseService.successResponse(
      bookingDetail,
      'Booking updated successfully',
    );
  }
  // Admins Only (Hard Deleted)
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteBooking(@Param('id') id: string) {
    const result = await this.bookingsService.delete(id);
    return ResponseService.successResponse(result, result.message);
  }
}
