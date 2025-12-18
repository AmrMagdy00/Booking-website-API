import { Test, TestingModule } from '@nestjs/testing';
import { PackagesService } from '../packages.service';
import { PackagesMapper } from '../mappers/packages.mapper';
import { CloudinaryService } from '@/shared/services/cloudinary.service';
import { AppLogger } from '@/common/logger/app-logger.service';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { PackagesRepository } from '../packages.repository';
import { Package } from '../schema/package.schema';
import { PackageListItemDto } from '../dtos/package-response.dto';

/**
 * PackagesService Unit Tests
 * Tests all business logic scenarios including success cases and error handling
 */
describe('PackagesService', () => {
  let service: PackagesService;
  let repository: jest.Mocked<PackagesRepository>;
  let mapper: jest.Mocked<PackagesMapper>;
  let cloudinaryService: jest.Mocked<CloudinaryService>;
  let logger: jest.Mocked<AppLogger>;

  // Mock data
  const mockPackageId = new Types.ObjectId().toString();
  const mockDestinationId = new Types.ObjectId().toString();
  const mockCreateDto = {
    destinationId: mockDestinationId,
    name: 'Test Package',
    description: 'Test Description',
    duration: 5,
    included: ['Breakfast', 'Lunch'],
    groupSize: 10,
    price: 1000,
  };

  const mockPackageDoc = {
    _id: new Types.ObjectId(mockPackageId),
    destinationId: new Types.ObjectId(mockDestinationId),
    name: 'Test Package',
    description: 'Test Description',
    duration: 5,
    included: ['Breakfast', 'Lunch'],
    image: {
      url: 'https://example.com/image.jpg',
      publicId: 'packages/test-image',
    },
    groupSize: 10,
    price: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn(),
  } as any;

  const mockFile = {
    path: '/tmp/test-image.jpg',
    originalname: 'test.jpg',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('test-image-data'),
  } as Express.Multer.File;

  beforeEach(async () => {
    // Create mocks for all dependencies
    const mockRepository = {
      create: jest.fn(),
      findByDestinationId: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
    };

    const mockMapper = {
      toPackageData: jest.fn(),
      toUpdateData: jest.fn(),
      toListItemDto: jest.fn(),
      toListItemDtoArray: jest.fn(),
      toDetailDto: jest.fn(),
    };

    const mockCloudinaryService = {
      uploadImage: jest.fn(),
      uploadImageFromBuffer: jest.fn(),
      deleteImage: jest.fn(),
    };

    const mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackagesService,
        {
          provide: PackagesRepository,
          useValue: mockRepository,
        },
        {
          provide: PackagesMapper,
          useValue: mockMapper,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
        {
          provide: AppLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<PackagesService>(PackagesService);
    repository = module.get(PackagesRepository);
    mapper = module.get(PackagesMapper);
    cloudinaryService = module.get(CloudinaryService);
    logger = module.get(AppLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a package successfully without image', async () => {
      // Arrange
      const packageData: Partial<Package> = {
        destinationId: new Types.ObjectId(mockDestinationId) as any,
        name: mockCreateDto.name,
        description: mockCreateDto.description,
        duration: mockCreateDto.duration,
        included: mockCreateDto.included,
        groupSize: mockCreateDto.groupSize,
        price: mockCreateDto.price,
      };
      const expectedDetailDto = { id: mockPackageId, ...mockPackageDoc };

      mapper.toPackageData.mockReturnValue(packageData);
      repository.create.mockResolvedValue(mockPackageDoc);
      mapper.toDetailDto.mockReturnValue(expectedDetailDto);

      // Act
      const result = await service.create(mockCreateDto);

      // Assert
      expect(mapper.toPackageData).toHaveBeenCalledWith(mockCreateDto);
      expect(repository.create).toHaveBeenCalledWith(packageData);
      expect(mapper.toDetailDto).toHaveBeenCalledWith(mockPackageDoc);
      expect(result).toEqual(expectedDetailDto);
      expect(logger.info).toHaveBeenCalledWith(
        'Creating new package',
        expect.objectContaining({ name: mockCreateDto.name }),
      );
      expect(logger.info).toHaveBeenCalledWith(
        'Package created successfully',
        expect.objectContaining({ packageId: mockPackageDoc._id }),
      );
    });

    it('should create a package successfully with image', async () => {
      // Arrange
      const packageData: Partial<Package> = {
        destinationId: new Types.ObjectId(mockDestinationId) as any,
        name: mockCreateDto.name,
        description: mockCreateDto.description,
        duration: mockCreateDto.duration,
        included: mockCreateDto.included,
        groupSize: mockCreateDto.groupSize,
        price: mockCreateDto.price,
      };
      const uploadResult = {
        url: 'https://example.com/image.jpg',
        publicId: 'packages/test',
      };
      const expectedDetailDto = { id: mockPackageId, ...mockPackageDoc };

      mapper.toPackageData.mockReturnValue(packageData);
      cloudinaryService.uploadImageFromBuffer.mockResolvedValue(uploadResult);
      repository.create.mockResolvedValue(mockPackageDoc);
      mapper.toDetailDto.mockReturnValue(expectedDetailDto);

      // Act
      const result = await service.create(mockCreateDto, mockFile);

      // Assert
      expect(cloudinaryService.uploadImageFromBuffer).toHaveBeenCalledWith(
        mockFile.buffer,
        'packages',
      );
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ image: uploadResult }),
      );
      expect(result).toEqual(expectedDetailDto);
      expect(logger.info).toHaveBeenCalledWith(
        'Package image uploaded successfully',
        expect.objectContaining({ publicId: uploadResult.publicId }),
      );
    });

    it('should throw InternalServerErrorException if image upload fails', async () => {
      // Arrange
      const packageData: Partial<Package> = {
        destinationId: new Types.ObjectId(mockDestinationId) as any,
        name: mockCreateDto.name,
        description: mockCreateDto.description,
        duration: mockCreateDto.duration,
        included: mockCreateDto.included,
        groupSize: mockCreateDto.groupSize,
        price: mockCreateDto.price,
      };
      mapper.toPackageData.mockReturnValue(packageData);
      cloudinaryService.uploadImageFromBuffer.mockRejectedValue(
        new Error('Upload failed'),
      );

      // Act & Assert
      await expect(service.create(mockCreateDto, mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to upload package image',
        expect.any(Object),
      );
    });

    it('should throw BadRequestException if package creation fails', async () => {
      // Arrange
      const packageData: Partial<Package> = {
        destinationId: new Types.ObjectId(mockDestinationId) as any,
        name: mockCreateDto.name,
        description: mockCreateDto.description,
        duration: mockCreateDto.duration,
        included: mockCreateDto.included,
        groupSize: mockCreateDto.groupSize,
        price: mockCreateDto.price,
      };
      mapper.toPackageData.mockReturnValue(packageData);
      repository.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.create(mockCreateDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to create package',
        expect.any(Object),
      );
    });
  });

  describe('findByDestinationId', () => {
    it('should return paginated packages successfully', async () => {
      // Arrange
      const queryDto = {
        destinationId: mockDestinationId,
        page: 1,
        limit: 10,
      };
      const mockPackages = [mockPackageDoc];
      const mockListItems: PackageListItemDto[] = [
        {
          id: mockPackageId,
          name: 'Test Package',
          description: 'Test Description',
          duration: 5,
          groupSize: 10,
          price: 1000,
        },
      ];
      const total = 1;

      repository.findByDestinationId.mockResolvedValue({
        packages: mockPackages,
        total,
      });
      mapper.toListItemDtoArray.mockReturnValue(mockListItems);

      // Act
      const result = await service.findByDestinationId(queryDto);

      // Assert
      expect(repository.findByDestinationId).toHaveBeenCalledWith(
        mockDestinationId,
        1,
        10,
      );
      expect(mapper.toListItemDtoArray).toHaveBeenCalledWith(mockPackages);
      expect(result.items).toEqual(mockListItems);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
      expect(logger.info).toHaveBeenCalled();
    });

    it('should use default pagination values', async () => {
      // Arrange
      const queryDto = { destinationId: mockDestinationId };
      repository.findByDestinationId.mockResolvedValue({
        packages: [],
        total: 0,
      });
      mapper.toListItemDtoArray.mockReturnValue([]);

      // Act
      await service.findByDestinationId(queryDto);

      // Assert
      expect(repository.findByDestinationId).toHaveBeenCalledWith(
        mockDestinationId,
        1,
        10,
      );
    });

    it('should throw BadRequestException if query fails', async () => {
      // Arrange
      const queryDto = { destinationId: mockDestinationId };
      repository.findByDestinationId.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.findByDestinationId(queryDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return package details when found', async () => {
      // Arrange
      const expectedDetailDto = { id: mockPackageId, ...mockPackageDoc };
      repository.findById.mockResolvedValue(mockPackageDoc);
      mapper.toDetailDto.mockReturnValue(expectedDetailDto);

      // Act
      const result = await service.findById(mockPackageId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(mockPackageId);
      expect(mapper.toDetailDto).toHaveBeenCalledWith(mockPackageDoc);
      expect(result).toEqual(expectedDetailDto);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should throw NotFoundException when package not found', async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(mockPackageId)).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        'Package not found',
        expect.objectContaining({ packageId: mockPackageId }),
      );
    });

    it('should throw BadRequestException if query fails', async () => {
      // Arrange
      repository.findById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.findById(mockPackageId)).rejects.toThrow(
        BadRequestException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update package successfully without image', async () => {
      // Arrange
      const updateDto = { name: 'Updated Package' };
      const updateData = { name: 'Updated Package' };
      const updatedPackage = { ...mockPackageDoc, name: 'Updated Package' };
      const expectedDetailDto = { id: mockPackageId, ...updatedPackage };

      repository.findById.mockResolvedValue(mockPackageDoc);
      mapper.toUpdateData.mockReturnValue(updateData);
      repository.updateById.mockResolvedValue(updatedPackage);
      mapper.toDetailDto.mockReturnValue(expectedDetailDto);

      // Act
      const result = await service.update(mockPackageId, updateDto);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(mockPackageId);
      expect(mapper.toUpdateData).toHaveBeenCalledWith(updateDto);
      expect(repository.updateById).toHaveBeenCalledWith(
        mockPackageId,
        updateData,
      );
      expect(result).toEqual(expectedDetailDto);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should update package with image replacement', async () => {
      // Arrange
      const updateDto = { name: 'Updated Package' };
      const updateData = { name: 'Updated Package' };
      const uploadResult = {
        url: 'https://example.com/new-image.jpg',
        publicId: 'packages/new',
      };
      const updatedPackage = { ...mockPackageDoc, image: uploadResult };
      const expectedDetailDto = { id: mockPackageId, ...updatedPackage };

      repository.findById.mockResolvedValue(mockPackageDoc);
      mapper.toUpdateData.mockReturnValue(updateData);
      cloudinaryService.deleteImage.mockResolvedValue(undefined);
      cloudinaryService.uploadImageFromBuffer.mockResolvedValue(uploadResult);
      repository.updateById.mockResolvedValue(updatedPackage);
      mapper.toDetailDto.mockReturnValue(expectedDetailDto);

      // Act
      const result = await service.update(mockPackageId, updateDto, mockFile);

      // Assert
      expect(cloudinaryService.deleteImage).toHaveBeenCalledWith(
        mockPackageDoc.image.publicId,
      );
      expect(cloudinaryService.uploadImageFromBuffer).toHaveBeenCalledWith(
        mockFile.buffer,
        'packages',
      );
      expect(repository.updateById).toHaveBeenCalledWith(
        mockPackageId,
        expect.objectContaining({ image: uploadResult }),
      );
      expect(result).toEqual(expectedDetailDto);
    });

    it('should throw NotFoundException if package not found', async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(mockPackageId, {})).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if image update fails', async () => {
      // Arrange
      repository.findById.mockResolvedValue(mockPackageDoc);
      mapper.toUpdateData.mockReturnValue({});
      cloudinaryService.deleteImage.mockRejectedValue(
        new Error('Delete failed'),
      );

      // Act & Assert
      await expect(service.update(mockPackageId, {}, mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete package successfully with image', async () => {
      // Arrange
      repository.findById.mockResolvedValue(mockPackageDoc);
      cloudinaryService.deleteImage.mockResolvedValue(undefined);
      repository.deleteById.mockResolvedValue(mockPackageDoc);

      // Act
      const result = await service.delete(mockPackageId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(mockPackageId);
      expect(cloudinaryService.deleteImage).toHaveBeenCalledWith(
        mockPackageDoc.image.publicId,
      );
      expect(repository.deleteById).toHaveBeenCalledWith(mockPackageId);
      expect(result).toEqual({ message: 'Package deleted successfully' });
      expect(logger.info).toHaveBeenCalled();
    });

    it('should delete package successfully without image', async () => {
      // Arrange
      const packageWithoutImage = { ...mockPackageDoc, image: undefined };
      repository.findById.mockResolvedValue(packageWithoutImage);
      repository.deleteById.mockResolvedValue(packageWithoutImage);

      // Act
      const result = await service.delete(mockPackageId);

      // Assert
      expect(cloudinaryService.deleteImage).not.toHaveBeenCalled();
      expect(repository.deleteById).toHaveBeenCalledWith(mockPackageId);
      expect(result).toEqual({ message: 'Package deleted successfully' });
    });

    it('should continue deletion even if image deletion fails', async () => {
      // Arrange
      repository.findById.mockResolvedValue(mockPackageDoc);
      cloudinaryService.deleteImage.mockRejectedValue(
        new Error('Delete failed'),
      );
      repository.deleteById.mockResolvedValue(mockPackageDoc);

      // Act
      const result = await service.delete(mockPackageId);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to delete package image from Cloudinary',
        expect.any(Object),
      );
      expect(repository.deleteById).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Package deleted successfully' });
    });

    it('should throw NotFoundException if package not found', async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.delete(mockPackageId)).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if deletion fails', async () => {
      // Arrange
      repository.findById.mockResolvedValue(mockPackageDoc);
      cloudinaryService.deleteImage.mockResolvedValue(undefined);
      repository.deleteById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.delete(mockPackageId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
