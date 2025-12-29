import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PackagesRepository } from './packages.repository';
import { PackagesMapper } from './mappers/packages.mapper';
import { CloudinaryService } from '@/shared/services/cloudinary.service';
import { AppLogger } from '@/common/logger/app-logger.service';
import { DestinationsService } from '@/modules/destinations/destinations.service';
import { CreatePackageDto } from './dtos/create-package.dto';
import { UpdatePackageDto } from './dtos/update-package.dto';
import { QueryPackageDto } from './dtos/query-package.dto';
import { PackageListItemDto } from './dtos/package-response.dto';
import { PackageDetailDto } from './dtos/package-response.dto';
import { JWTPayloadType } from '@/common/auth/types/jwt-payload.type';

/**
 * PackagesService - Business logic layer for packages
 * Handles all business rules, error handling, and orchestrates repository, mapper, and external services
 * Logs important operations and errors using AppLogger
 */
@Injectable()
export class PackagesService {
  constructor(
    private readonly packagesRepository: PackagesRepository,
    private readonly packagesMapper: PackagesMapper,
    private readonly cloudinaryService: CloudinaryService,
    private readonly logger: AppLogger,
    @Inject(forwardRef(() => DestinationsService))
    private readonly destinationsService: DestinationsService,
  ) {}

  async create(
    dto: CreatePackageDto,
    currentUser: JWTPayloadType,
    file?: Express.Multer.File,
  ): Promise<PackageDetailDto> {
    try {
      this.logger.info('Admin creating new package', {
        name: dto.name,
        destinationId: dto.destinationId,
        actorId: currentUser.id,
      });

      // First check if the destination id is valid and exists
      try {
        await this.destinationsService.findById(dto.destinationId);
      } catch (error) {
        if (error instanceof NotFoundException) {
          this.logger.warn('Destination not found when creating package', {
            destinationId: dto.destinationId,
          });
          throw new NotFoundException('Destination not found');
        }
        throw error;
      }

      const packageData = this.packagesMapper.toPackageData(dto);

      if (file) {
        try {
          const uploadResult =
            await this.cloudinaryService.uploadImageFromBuffer(
              file.buffer,
              'packages',
            );

          packageData.image = {
            url: uploadResult.url,
            publicId: uploadResult.publicId,
          };

          this.logger.info('Package image uploaded successfully', {
            publicId: uploadResult.publicId,
          });
        } catch (error) {
          this.logger.error('Failed to upload package image', { error });
          throw new InternalServerErrorException(
            'Failed to upload package image',
          );
        }
      } else {
        this.logger.error('Image Is Not Provided to the service');
        throw new InternalServerErrorException(
          'Failed to upload package image',
        );
      }

      const createdPackage = await this.packagesRepository.create(packageData);

      this.logger.info('Package created successfully', {
        packageId: createdPackage._id,
      });

      return this.packagesMapper.toDetailDto(createdPackage);
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      this.logger.error('Failed to create package', { error, dto });
      throw new BadRequestException('Failed to create package');
    }
  }

  async findByDestinationId(queryDto: QueryPackageDto): Promise<{
    items: PackageListItemDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    try {
      const page = queryDto.page || 1;
      const limit = queryDto.limit || 10;

      this.logger.info('Fetching packages by destination', {
        destinationId: queryDto.destinationId,
        page,
        limit,
      });

      // First check if the destination id is valid and exists
      try {
        await this.destinationsService.findById(queryDto.destinationId);
      } catch (error) {
        if (error instanceof NotFoundException) {
          this.logger.warn('Destination not found', {
            destinationId: queryDto.destinationId,
          });
          throw new NotFoundException('Destination not found');
        }
        throw error;
      }

      const { packages, total } =
        await this.packagesRepository.findByDestinationId(
          queryDto.destinationId,
          page,
          limit,
        );

      const totalPages = Math.ceil(total / limit);
      const items = this.packagesMapper.toListItemDtoArray(packages);

      this.logger.info('Packages fetched successfully', {
        destinationId: queryDto.destinationId,
        count: items.length,
        total,
      });

      return {
        items,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch packages by destination', {
        error,
        queryDto,
      });
      throw new BadRequestException('Failed to fetch packages');
    }
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{
    items: PackageListItemDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    try {
      this.logger.info('Admin fetching all packages', {
        page,
        limit,
      });

      const { packages, total } = await this.packagesRepository.findAll(
        page,
        limit,
      );

      const totalPages = Math.ceil(total / limit);
      const items = this.packagesMapper.toListItemDtoArray(packages);

      this.logger.info('All packages fetched successfully', {
        count: items.length,
        total,
      });

      return {
        items,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch all packages', {
        error,
      });
      throw new BadRequestException('Failed to fetch packages');
    }
  }

  async findById(id: string): Promise<PackageDetailDto> {
    try {
      this.logger.info('Fetching package by ID', { packageId: id });

      const packageDoc = await this.packagesRepository.findById(id);

      if (!packageDoc) {
        this.logger.warn('Package not found', { packageId: id });
        throw new NotFoundException('Package not found');
      }

      this.logger.info('Package fetched successfully', { packageId: id });
      return this.packagesMapper.toDetailDto(packageDoc);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to fetch package by ID', {
        error,
        packageId: id,
      });
      throw new BadRequestException('Failed to fetch package');
    }
  }
  async update(
    id: string,
    dto: UpdatePackageDto,
    currentUser: JWTPayloadType,
    file?: Express.Multer.File,
  ): Promise<PackageDetailDto> {
    try {
      this.logger.info('Admin updating package', {
        packageId: id,
        actorId: currentUser.id,
      });

      const existingPackage = await this.packagesRepository.findById(id);
      if (!existingPackage) {
        this.logger.warn('Package not found for update', { packageId: id });
        throw new NotFoundException('Package not found');
      }

      const updateData = this.packagesMapper.toUpdateData(dto);

      if (file) {
        try {
          // delete old image
          if (existingPackage.image?.publicId) {
            await this.cloudinaryService.deleteImage(
              existingPackage.image.publicId,
            );
            this.logger.info('Old package image deleted', {
              publicId: existingPackage.image.publicId,
            });
          }

          // upload new image directly from memory
          const uploadResult =
            await this.cloudinaryService.uploadImageFromBuffer(
              file.buffer,
              'packages',
            );

          updateData.image = {
            url: uploadResult.url,
            publicId: uploadResult.publicId,
          };

          this.logger.info('New package image uploaded', {
            publicId: uploadResult.publicId,
          });
        } catch (error) {
          this.logger.error('Failed to update package image', { error });
          throw new InternalServerErrorException(
            'Failed to update package image',
          );
        }
      }

      const updatedPackage = await this.packagesRepository.updateById(
        id,
        updateData,
      );

      if (!updatedPackage) {
        throw new NotFoundException('Package not found');
      }

      this.logger.info('Package updated successfully', { packageId: id });
      return this.packagesMapper.toDetailDto(updatedPackage);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      this.logger.error('Failed to update package', {
        error,
        packageId: id,
        dto,
      });
      throw new InternalServerErrorException('Failed to update package');
    }
  }

  async delete(
    id: string,
    currentUser: JWTPayloadType,
  ): Promise<{ message: string }> {
    try {
      this.logger.info('Admin deleting package', {
        packageId: id,
        actorId: currentUser.id,
      });

      // Find package to get image publicId
      const packageDoc = await this.packagesRepository.findById(id);
      if (!packageDoc) {
        this.logger.warn('Package not found for deletion', { packageId: id });
        throw new NotFoundException('Package not found');
      }

      // Delete image from Cloudinary if it exists
      if (packageDoc.image?.publicId) {
        try {
          await this.cloudinaryService.deleteImage(packageDoc.image.publicId);
          this.logger.info('Package image deleted from Cloudinary', {
            publicId: packageDoc.image.publicId,
          });
        } catch (error) {
          this.logger.error('Failed to delete package image from Cloudinary', {
            error,
          });
          // Continue with package deletion even if image deletion fails
        }
      }

      // Delete package from database
      const deletedPackage = await this.packagesRepository.deleteById(id);
      if (!deletedPackage) {
        this.logger.warn('Package not found after deletion attempt', {
          packageId: id,
        });
        throw new NotFoundException('Package not found');
      }

      this.logger.info('Package deleted successfully', { packageId: id });
      return { message: 'Package deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to delete package', { error, packageId: id });
      throw new InternalServerErrorException('Failed to delete package');
    }
  }

  /**
   * Gets packages statistics for a destination
   * @param destinationId - Destination ID
   * @returns Object containing packages count and minimum price
   */
  async getPackagesStatsByDestinationId(destinationId: string): Promise<{
    count: number;
    minPrice: number | null;
  }> {
    return await this.packagesRepository.getPackagesStatsByDestinationId(
      destinationId,
    );
  }

  /**
   * Gets packages statistics for multiple destinations
   * @param destinationIds - Array of Destination IDs
   * @returns Map of destinationId to stats (count and minPrice)
   */
  async getPackagesStatsByDestinationIds(
    destinationIds: string[],
  ): Promise<Map<string, { count: number; minPrice: number | null }>> {
    return await this.packagesRepository.getPackagesStatsByDestinationIds(
      destinationIds,
    );
  }
}
