import { Image } from '@/shared/schemas/image.schema';

export class DestinationListItemDto {
  _id: string;
  name: string;
  image: Image;
}

export class DestinationDetailDto {
  _id: string;
  name: string;
  description: string;
  image: Image;
  createdAt: Date;
  updatedAt: Date;
}
