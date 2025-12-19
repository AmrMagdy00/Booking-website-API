import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BookingContact,
  BookingContactDocument,
} from './booking-contact.schema';

/**
 * BookingContactRepository - Repository layer for database operations
 * Handles all direct database interactions for booking contacts
 */
@Injectable()
export class BookingContactRepository {
  constructor(
    @InjectModel(BookingContact.name)
    private readonly bookingContactModel: Model<BookingContactDocument>,
  ) {}

  async create(
    contactData: Partial<BookingContact>,
  ): Promise<BookingContactDocument> {
    return await this.bookingContactModel.create(contactData);
  }

  async findById(id: string): Promise<BookingContactDocument | null> {
    return await this.bookingContactModel.findById(id).exec();
  }
}
