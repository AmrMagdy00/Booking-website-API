import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingContactRepository } from './booking-contact.repository';
import {
  BookingContact,
  BookingContactDocument,
} from './booking-contact.schema';
import { Types } from 'mongoose';

/**
 * BookingContactService - Service for booking contact operations
 * Used internally by BookingService to manage contact information
 */
@Injectable()
export class BookingContactService {
  constructor(
    private readonly bookingContactRepository: BookingContactRepository,
  ) {}

  async create(contactData: {
    name: string;
    email: string;
    phone: string;
    userId?: string;
  }): Promise<BookingContactDocument> {
    const data: Partial<BookingContact> = {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
    };

    if (contactData.userId) {
      data.userId = new Types.ObjectId(contactData.userId) as any;
    }

    return await this.bookingContactRepository.create(data);
  }

  async findById(id: string): Promise<BookingContactDocument> {
    const contact = await this.bookingContactRepository.findById(id);

    if (!contact) {
      throw new NotFoundException('Booking contact not found');
    }

    return contact;
  }
}
