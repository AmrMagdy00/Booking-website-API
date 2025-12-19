import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BookingContactDocument = HydratedDocument<BookingContact>;

/**
 * BookingContact - Mongoose schema for booking contact information
 * Represents contact details for a booking (name, email, phone)
 * Can optionally be linked to a user account
 */
@Schema({ timestamps: true })
export class BookingContact {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: false,
    index: true,
  })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  createdAt?: Date;

  updatedAt?: Date;
}

export const BookingContactSchema =
  SchemaFactory.createForClass(BookingContact);

