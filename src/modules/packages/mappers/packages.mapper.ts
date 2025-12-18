import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { Package, PackageDocument } from '../schema/package.schema';
import {
  PackageListItemDto,
  PackageDetailDto,
} from '../dtos/package-response.dto';
import { CreatePackageDto } from '../dtos/create-package.dto';
import { UpdatePackageDto } from '../dtos/update-package.dto';

/**
 * PackagesMapper - Mapper layer for transforming between schemas and DTOs
 * Handles all data transformation logic between database models and API responses
 * Ensures clean separation between data layer and presentation layer
 */
@Injectable()
export class PackagesMapper {
  toListItemDto(packageDoc: PackageDocument): PackageListItemDto {
    return {
      id: packageDoc._id.toString(),
      name: packageDoc.name,
      description: packageDoc.description,
      duration: packageDoc.duration,
      groupSize: packageDoc.groupSize,
      price: packageDoc.price,
    };
  }

  toDetailDto(packageDoc: PackageDocument): PackageDetailDto {
    return {
      id: packageDoc._id.toString(),
      destinationId: packageDoc.destinationId.toString(),
      name: packageDoc.name,
      description: packageDoc.description,
      duration: packageDoc.duration,
      included: packageDoc.included || [],
      image: packageDoc.image,
      groupSize: packageDoc.groupSize,
      price: packageDoc.price,
      createdAt: packageDoc.createdAt || new Date(),
      updatedAt: packageDoc.updatedAt || new Date(),
    };
  }

  toListItemDtoArray(packageDocs: PackageDocument[]): PackageListItemDto[] {
    return packageDocs.map((doc) => this.toListItemDto(doc));
  }

  toPackageData(dto: CreatePackageDto): Partial<Package> {
    return {
      destinationId: new Types.ObjectId(dto.destinationId) as any,
      name: dto.name,
      description: dto.description,
      duration: dto.duration,
      included: dto.included || [],
      groupSize: dto.groupSize,
      price: dto.price,
    };
  }

  toUpdateData(dto: UpdatePackageDto): Partial<Package> {
    const updateData: Partial<Package> = {};

    if (dto.destinationId !== undefined) {
      updateData.destinationId = new Types.ObjectId(dto.destinationId) as any;
    }
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.duration !== undefined) updateData.duration = dto.duration;
    if (dto.included !== undefined) updateData.included = dto.included;
    if (dto.groupSize !== undefined) updateData.groupSize = dto.groupSize;
    if (dto.price !== undefined) updateData.price = dto.price;

    return updateData;
  }
}
