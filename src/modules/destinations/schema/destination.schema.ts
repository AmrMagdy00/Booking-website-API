import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Image } from '@/shared/schemas/image.schema';

@Schema({ timestamps: true })
export class Destination extends Document {
  @Prop({ required: true, trim: true, minLength: 2, maxLength: 100 })
  name: string;

  @Prop({ required: true, trim: true, minLength: 3 })
  description: string;

  @Prop({ required: true, type: Image, _id: false })
  image: Image;

  @Prop({ default: null })
  deletedAt: Date;
}

export const DestinationSchema = SchemaFactory.createForClass(Destination);

DestinationSchema.index({ name: 1 });
