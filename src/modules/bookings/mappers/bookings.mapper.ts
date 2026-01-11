import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  Booking,
  BookingDocument,
} from '@/modules/bookings/schema/booking.schema';
import {
  BookingListItemDto,
  BookingDetailDto,
  BookingContactDto,
} from '@/modules/bookings/dtos/booking-response.dto';
import { CreateBookingDto } from '@/modules/bookings/dtos/create-booking.dto';
import { UpdateBookingDto } from '@/modules/bookings/dtos/update-booking.dto';
import { BookingStatus } from '@/modules/bookings/enums/booking-status.enum';
import { BookingContactDocument } from '@/modules/bookings/booking-contact/booking-contact.schema';

/**
 * BookingsMapper - Mapper layer for transforming between schemas and DTOs
 * Handles all data transformation logic between database models and API responses
 * Ensures clean separation between data layer and presentation layer
 */
@Injectable()
export class BookingsMapper {
  toContactDto(contact: BookingContactDocument): BookingContactDto {
    return {
      id: contact._id.toString(),
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
    };
  }

  toListItemDto(
    bookingDoc: BookingDocument,
    contact: BookingContactDocument,
  ): BookingListItemDto {
    return {
      id: bookingDoc._id.toString(),
      userId: bookingDoc.userId.toString(),
      contactId: bookingDoc.contactId.toString(),
      contact: this.toContactDto(contact),
      packageId: bookingDoc.packageId.toString(),
      numberOfPeople: bookingDoc.numberOfPeople,
      totalPrice: bookingDoc.totalPrice,
      status: bookingDoc.status,
    };
  }

  toDetailDto(
    bookingDoc: BookingDocument,
    contact: BookingContactDocument,
  ): BookingDetailDto {
    return {
      id: bookingDoc._id.toString(),
      userId: bookingDoc.userId.toString(),
      contactId: bookingDoc.contactId.toString(),
      contact: this.toContactDto(contact),
      packageId: bookingDoc.packageId.toString(),
      numberOfPeople: bookingDoc.numberOfPeople,
      totalPrice: bookingDoc.totalPrice,
      status: bookingDoc.status,
      createdAt: bookingDoc.createdAt || new Date(),
      updatedAt: bookingDoc.updatedAt || new Date(),
    };
  }

  toListItemDtoArray(
    bookingDocs: BookingDocument[],
    contacts: BookingContactDocument[],
  ): BookingListItemDto[] {
    const contactMap = new Map(
      contacts.map((c) => [c._id.toString(), c]),
    );
    return bookingDocs.map((doc) => {
      const contact = contactMap.get(doc.contactId.toString());
      if (!contact) {
        throw new Error(
          `Contact not found for booking ${doc._id.toString()}`,
        );
      }
      return this.toListItemDto(doc, contact);
    });
  }

  toBookingData(
    dto: CreateBookingDto & { contactId: string; userId: string },
  ): Partial<Booking> {
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
