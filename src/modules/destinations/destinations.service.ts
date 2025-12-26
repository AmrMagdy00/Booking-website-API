import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { DestinationsRepository } from './destinations.repository';
import { DestinationsMapper } from './mappers/destinations.mapper';
import { PackagesService } from '@/modules/packages/packages.service';
import { AppLogger } from '@/common/logger/app-logger.service';
import { CloudinaryService } from '@/shared/services/cloudinary.service';
import { CreateDestinationDto } from './dtos/create-destination.dto';
import { UpdateDestinationDto } from './dtos/update-destination.dto';
import { QueryDestinationDto } from './dtos/query-destination.dto';
import {
  DestinationListItemDto,
  DestinationDetailDto,
} from './dtos/destination-response.dto';
import { JWTPayloadType } from '@/common/auth/types/jwt-payload.type';

@Injectable()
export class DestinationsService {
  constructor(
    private readonly destinationsRepository: DestinationsRepository,
    private readonly destinationsMapper: DestinationsMapper,
    @Inject(forwardRef(() => PackagesService))
    private readonly packagesService: PackagesService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly logger: AppLogger,
  ) {}

  async findAll(queryDto: QueryDestinationDto): Promise<{
    items: DestinationListItemDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    try {
      const page = queryDto.page || 1;
      const limit = queryDto.limit || 10;

      this.logger.info('Fetching destinations', { page, limit });

      const query: any = {};
      if (queryDto.name) {
        query.name = { $regex: queryDto.name, $options: 'i' };
      }

      const { destinations, total } = await this.destinationsRepository.findAll(
        query,
        page,
        limit,
      );

      // Get packages statistics for all destinations
      const destinationIds = destinations.map((d) => d._id.toString());
      const packagesStats =
        await this.packagesService.getPackagesStatsByDestinationIds(
          destinationIds,
        );

      const items = this.destinationsMapper.toListItemDtoArray(
        destinations,
        packagesStats,
      );
      const totalPages = Math.ceil(total / limit);

      return {
        items,
        meta: { page, limit, total, totalPages },
      };
    } catch (error) {
      this.logger.error('Failed to fetch destinations', { error });
      throw new InternalServerErrorException('Failed to fetch destinations');
    }
  }

  async findById(id: string): Promise<DestinationDetailDto> {
    try {
      this.logger.info('Fetching destination by ID', { id });

      const destination = await this.destinationsRepository.findById(id);

      if (!destination) {
        this.logger.warn('Destination not found', { id });
        throw new NotFoundException('Destination not found');
      }

      // Get packages statistics for this destination
      const packagesStats =
        await this.packagesService.getPackagesStatsByDestinationId(id);

      return this.destinationsMapper.toDetailDto(
        destination,
        packagesStats.count,
        packagesStats.minPrice,
      );
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Failed to fetch destination', { error, id });
      throw new InternalServerErrorException('Failed to fetch destination');
    }
  }

  async create(
    dto: CreateDestinationDto,
    currentUser: JWTPayloadType,
    file: Express.Multer.File,
  ): Promise<DestinationDetailDto> {
    try {
      this.logger.info('Admin creating new destination', {
        name: dto.name,
        actorId: currentUser.id,
      });

      const data = this.destinationsMapper.toPersistence(dto);

      const uploadResult = await this.cloudinaryService.uploadImageFromBuffer(
        file.buffer,
        'destinations',
      );

      data.image = {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      };

      const createdDestination = await this.destinationsRepository.create(data);

      this.logger.info('Destination created successfully', {
        id: createdDestination._id,
      });

      return this.destinationsMapper.toDetailDto(createdDestination);
    } catch (error) {
      this.logger.error('Failed to create destination', { error, dto });
      throw new BadRequestException('Failed to create destination');
    }
  }

  async update(
    id: string,
    dto: UpdateDestinationDto,
    currentUser: JWTPayloadType,
    file?: Express.Multer.File,
  ): Promise<DestinationDetailDto> {
    try {
      this.logger.info('Admin updating destination', {
        id,
        actorId: currentUser.id,
      });

      const existingDestination =
        await this.destinationsRepository.findById(id);
      if (!existingDestination) {
        this.logger.warn('Destination not found for update', { id });
        throw new NotFoundException('Destination not found');
      }

      const updateData = this.destinationsMapper.toUpdatePersistence(dto);

      if (file) {
        if (existingDestination.image?.publicId) {
          await this.cloudinaryService.deleteImage(
            existingDestination.image.publicId,
          );
        }

        const uploadResult = await this.cloudinaryService.uploadImageFromBuffer(
          file.buffer,
          'destinations',
        );

        updateData.image = {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
        };
      }

      const updatedDestination = await this.destinationsRepository.updateById(
        id,
        updateData,
      );

      if (!updatedDestination) {
        this.logger.warn('Destination not found for update', { id });
        throw new NotFoundException('Destination not found');
      }

      this.logger.info('Destination updated successfully', { id });

      return this.destinationsMapper.toDetailDto(updatedDestination);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Failed to update destination', { error, id, dto });
      throw new BadRequestException('Failed to update destination');
    }
  }

  async delete(
    id: string,
    currentUser: JWTPayloadType,
  ): Promise<{ message: string }> {
    try {
      this.logger.info('Admin deleting destination', {
        id,
        actorId: currentUser.id,
      });

      const existingDestination =
        await this.destinationsRepository.findById(id);
      if (!existingDestination) {
        this.logger.warn('Destination not found for deletion', { id });
        throw new NotFoundException('Destination not found');
      }

      if (existingDestination.image?.publicId) {
        await this.cloudinaryService.deleteImage(
          existingDestination.image.publicId,
        );
      }

      const deletedDestination =
        await this.destinationsRepository.deleteById(id);

      if (!deletedDestination) {
        this.logger.warn('Destination not found for deletion', { id });
        throw new NotFoundException('NotFoundException');
      }

      this.logger.info('Destination deleted successfully', { id });

      return { message: 'Destination deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Failed to delete destination', { error, id });
      throw new InternalServerErrorException('Failed to delete destination');
    }
  }
}
