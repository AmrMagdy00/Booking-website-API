import { IsOptional, IsInt, IsEnum, IsMongoId, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from '../enums/booking-status.enum';

/**
 * QueryBookingDto - Data Transfer Object for querying bookings
 * Used for filtering and pagination in GET /bookings endpoint
 */
export class QueryBookingDto {
  // Contact ID - optional filter
  @IsOptional()
  @IsMongoId()
  contactId?: string;

  // User ID - optional filter
  @IsOptional()
  @IsMongoId()
  userId?: string;

  // Package ID - optional filter
  @IsOptional()
  @IsMongoId()
  packageId?: string;

  // Status - optional filter
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  // Page number - optional, defaults to 1, minimum 1
  @IsOptional()
  @Type(() => Number) // Convert string to number from query params
  @IsInt()
  @Min(1)
  page?: number = 1;

  // Items per page - optional, defaults to 10, minimum 1
  @IsOptional()
  @Type(() => Number) // Convert string to number from query params
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

