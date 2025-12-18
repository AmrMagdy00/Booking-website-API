import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Image } from '@/shared/schemas/image.schema';

export type PackageDocument = HydratedDocument<Package>;

/**
 * Package - Mongoose schema for travel packages
 * Represents a travel package associated with a destination
 */
@Schema({ timestamps: true })
export class Package {
  @Prop({
    type: Types.ObjectId,
    ref: 'Destination',
    required: true,
    index: true,
  })
  destinationId: Types.ObjectId;

  @Prop({ required: true, minlength: 2, maxlength: 100 })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 1 })
  duration: number;

  @Prop({ type: [String], default: [] })
  included: string[];

  @Prop({ required: true, type: Image, _id: false })
  image: Image;

  @Prop({ required: true, min: 1 })
  groupSize: number;

  @Prop({ required: true, min: 0 })
  price: number;

  createdAt?: Date;

  updatedAt?: Date;
}

export const PackageSchema = SchemaFactory.createForClass(Package);
