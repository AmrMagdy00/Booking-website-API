import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';

/**
 * UpdateBookingDto - Data Transfer Object for updating a booking
 * Extends CreateBookingDto with all fields optional (using PartialType)
 * Allows partial updates to booking properties
 */
export class UpdateBookingDto extends PartialType(CreateBookingDto) {}
