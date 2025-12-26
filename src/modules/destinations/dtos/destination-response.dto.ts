import { Image } from '@/shared/schemas/image.schema';

export class DestinationListItemDto {
  _id: string;
  name: string;
  image: Image;
  packagesCount: number;
  minPrice: number | null;
}

export class DestinationDetailDto {
  _id: string;
  name: string;
  description: string;
  image: Image;
  packagesCount: number;
  minPrice: number | null;
  createdAt: Date;
  updatedAt: Date;
}
