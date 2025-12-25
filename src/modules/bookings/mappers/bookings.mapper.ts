import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { Booking, BookingDocument } from '../schema/booking.schema';
import {
  BookingListItemDto,
  BookingDetailDto,
} from '../dtos/booking-response.dto';
import { CreateBookingDto } from '../dtos/create-booking.dto';
import { UpdateBookingDto } from '../dtos/update-booking.dto';
import { BookingStatus } from '../enums/booking-status.enum';

/**
 * BookingsMapper - Mapper layer for transforming between schemas and DTOs
 * Handles all data transformation logic between database models and API responses
 * Ensures clean separation between data layer and presentation layer
 */
@Injectable()
export class BookingsMapper {
  toListItemDto(bookingDoc: BookingDocument): BookingListItemDto {
    return {
      id: bookingDoc._id.toString(),
      userId: bookingDoc.userId.toString(),
      contactId: bookingDoc.contactId.toString(),
      packageId: bookingDoc.packageId.toString(),
      numberOfPeople: bookingDoc.numberOfPeople,
      totalPrice: bookingDoc.totalPrice,
      status: bookingDoc.status,
    };
  }

  toDetailDto(bookingDoc: BookingDocument): BookingDetailDto {
    return {
      id: bookingDoc._id.toString(),
      userId: bookingDoc.userId.toString(),
      contactId: bookingDoc.contactId.toString(),
      packageId: bookingDoc.packageId.toString(),
      numberOfPeople: bookingDoc.numberOfPeople,
      totalPrice: bookingDoc.totalPrice,
      status: bookingDoc.status,
      createdAt: bookingDoc.createdAt || new Date(),
      updatedAt: bookingDoc.updatedAt || new Date(),
    };
  }

  toListItemDtoArray(bookingDocs: BookingDocument[]): BookingListItemDto[] {
    return bookingDocs.map((doc) => this.toListItemDto(doc));
  }

  toBookingData(dto: CreateBookingDto & { contactId: string; userId: string }): Partial<Booking> {
    return {
      userId: new Types.ObjectId(dto.userId) as any,
      contactId: new Types.ObjectId(dto.contactId) as any,
      packageId: new Types.ObjectId(dto.packageId) as any,
      numberOfPeople: dto.numberOfPeople,
      totalPrice: dto.totalPrice,
      status: dto.status || BookingStatus.PENDING,
    };
  }

  toUpdateData(dto: UpdateBookingDto): Partial<Booking> {
    const updateData: Partial<Booking> = {};

    // Note: contactId is not updatable - contact is created with booking
    if (dto.packageId !== undefined) {
      updateData.packageId = new Types.ObjectId(dto.packageId) as any;
    }
    if (dto.numberOfPeople !== undefined)
      updateData.numberOfPeople = dto.numberOfPeople;
    if (dto.totalPrice !== undefined) updateData.totalPrice = dto.totalPrice;
    if (dto.status !== undefined) updateData.status = dto.status;

    return updateData;
  }
}

