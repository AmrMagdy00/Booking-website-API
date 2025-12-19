import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './schema/booking.schema';

/**
 * BookingsRepository - Repository layer for database operations
 * Handles all direct database interactions for bookings
 * Separates data access logic from business logic
 */
@Injectable()
export class BookingsRepository {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
  ) {}

  async create(bookingData: Partial<Booking>): Promise<BookingDocument> {
    return await this.bookingModel.create(bookingData);
  }

  async findAll(
    query: any,
    page: number,
    limit: number,
  ): Promise<{ bookings: BookingDocument[]; total: number }> {
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      this.bookingModel.find(query).skip(skip).limit(limit).exec(),
      this.bookingModel.countDocuments(query).exec(),
    ]);

    return { bookings, total };
  }

  async findById(id: string): Promise<BookingDocument | null> {
    return await this.bookingModel.findById(id).exec();
  }

  async updateById(
    id: string,
    updateData: Partial<Booking>,
  ): Promise<BookingDocument | null> {
    return await this.bookingModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async deleteById(id: string): Promise<BookingDocument | null> {
    return await this.bookingModel.findByIdAndDelete(id).exec();
  }
}
