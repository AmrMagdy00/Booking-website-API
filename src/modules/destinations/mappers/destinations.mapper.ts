import { Injectable } from '@nestjs/common';
import { Destination } from '@/modules/destinations/schema/destination.schema';
import {
  DestinationListItemDto,
  DestinationDetailDto,
} from '@/modules/destinations/dtos/destination-response.dto';
import { CreateDestinationDto } from '@/modules/destinations/dtos/create-destination.dto';
import { UpdateDestinationDto } from '@/modules/destinations/dtos/update-destination.dto';

@Injectable()
export class DestinationsMapper {
  toListItemDto(
    destination: Destination,
    packagesCount: number = 0,
    minPrice: number | null = null,
  ): DestinationListItemDto {
    return {
      _id: destination._id.toString(),
      name: destination.name,
      image: {
        url: destination.image.url,
        publicId: destination.image.publicId,
      },
      packagesCount,
      minPrice,
    };
  }

  toListItemDtoArray(
    destinations: Destination[],
    statsMap?: Map<string, { count: number; minPrice: number | null }>,
  ): DestinationListItemDto[] {
    return destinations.map((destination) => {
      const destinationId = destination._id.toString();
      const stats = statsMap?.get(destinationId) || {
        count: 0,
        minPrice: null,
      };
      return this.toListItemDto(destination, stats.count, stats.minPrice);
    });
  }

  toDetailDto(
    destination: Destination,
    packagesCount: number = 0,
    minPrice: number | null = null,
  ): DestinationDetailDto {
    return {
      _id: destination._id.toString(),
      name: destination.name,
      description: destination.description,
      image: {
        url: destination.image.url,
        publicId: destination.image.publicId,
      },
      packagesCount,
      minPrice,
      createdAt: (destination as any).createdAt,
      updatedAt: (destination as any).updatedAt,
    };
  }

  toPersistence(dto: CreateDestinationDto): Partial<Destination> {
    return {
      name: dto.name,
      description: dto.description,
    };
  }

  toUpdatePersistence(dto: UpdateDestinationDto): Partial<Destination> {
    const updateData: Partial<Destination> = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.description) updateData.description = dto.description;
    return updateData;
  }
}
