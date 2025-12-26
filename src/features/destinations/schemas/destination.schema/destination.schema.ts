import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Image } from '@/shared/schemas/image.schema';
export type DestinationDocument = HydratedDocument<Destination>;

@Schema({ timestamps: true })
export class Destination {
  @Prop({ required: true, minLength: 2, maxLength: 100 })
  name: string;

  @Prop({ required: true, minLength: 2, maxLength: 30 })
  governoratName: string;

  @Prop({ required: true, minLength: 3 })
  description: string;

  @Prop({ type: [Image], default: [] })
  images: Image[];
}

export const DestinationSchema = SchemaFactory.createForClass(Destination);
