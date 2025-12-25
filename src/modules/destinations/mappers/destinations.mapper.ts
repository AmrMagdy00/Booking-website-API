import { Injectable } from '@nestjs/common';
import { Destination } from '../schema/destination.schema';
import {
  DestinationListItemDto,
  DestinationDetailDto,
} from '../dtos/destination-response.dto';
import { CreateDestinationDto } from '../dtos/create-destination.dto';
import { UpdateDestinationDto } from '../dtos/update-destination.dto';

@Injectable()
export class DestinationsMapper {
  toListItemDto(destination: Destination): DestinationListItemDto {
    return {
      _id: destination._id.toString(),
      name: destination.name,
      image: {
        url: destination.image.url,
        publicId: destination.image.publicId,
      },
    };
  }

  toListItemDtoArray(destinations: Destination[]): DestinationListItemDto[] {
    return destinations.map((destination) => this.toListItemDto(destination));
  }

  toDetailDto(destination: Destination): DestinationDetailDto {
    return {
      _id: destination._id.toString(),
      name: destination.name,
      description: destination.description,
      image: {
        url: destination.image.url,
        publicId: destination.image.publicId,
      },
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
