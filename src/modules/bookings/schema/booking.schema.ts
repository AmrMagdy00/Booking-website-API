import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BookingStatus } from '../enums/booking-status.enum';

export type BookingDocument = HydratedDocument<Booking>;

/**
 * Booking - Mongoose schema for travel bookings
 * Represents a booking for a package with contact information and status
 */
@Schema({ timestamps: true })
export class Booking {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'BookingContact',
    required: true,
    index: true,
  })
  contactId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Package',
    required: true,
    index: true,
  })
  packageId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  numberOfPeople: number;

  @Prop({ required: true, min: 0 })
  totalPrice: number;

  @Prop({
    type: String,
    enum: Object.values(BookingStatus),
    default: BookingStatus.PENDING,
    required: true,
    index: true,
  })
  status: BookingStatus;

  createdAt?: Date;

  updatedAt?: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

