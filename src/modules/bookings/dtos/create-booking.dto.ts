import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  IsEmail,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from '../enums/booking-status.enum';

/**
 * Contact information embedded in booking creation
 */
class ContactInfo {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;
}

export class CreateBookingDto {
  // User ID - optional, for authenticated users
  @IsOptional()
  @IsMongoId()
  userId?: string;

  // Contact information - required
  @IsNotEmpty()
  contact: ContactInfo;

  // Package ID - must be valid MongoDB ObjectId
  @IsNotEmpty()
  @IsMongoId()
  packageId: string;

  // Number of people - required, minimum 1
  @IsNotEmpty()
  @Type(() => Number) // Convert string to number
  @IsNumber()
  @Min(1)
  numberOfPeople: number;

  // Total price - required, minimum 0
  @IsNotEmpty()
  @Type(() => Number) // Convert string to number
  @IsNumber()
  @Min(0)
  totalPrice: number;

  // Status - optional, defaults to PENDING
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
