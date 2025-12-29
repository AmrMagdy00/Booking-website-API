import { Test, TestingModule } from '@nestjs/testing';
import { PackagesService } from '@/modules/packages/packages.service';
import { PackagesMapper } from '@/modules/packages/mappers/packages.mapper';
import { CloudinaryService } from '@/shared/services/cloudinary.service';
import { AppLogger } from '@/common/logger/app-logger.service';
import { DestinationsService } from '@/modules/destinations/destinations.service';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { PackagesRepository } from '@/modules/packages/packages.repository';
import { Package } from '@/modules/packages/schema/package.schema';
import { PackageListItemDto } from '@/modules/packages/dtos/package-response.dto';
import { UserRole } from '@/modules/users/enums/user-role.enum';

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
  let destinationsService: jest.Mocked<DestinationsService>;

  // Mock data
  const mockUser = {
    id: 'user123',
    email: 'admin@test.com',
    userName: 'adminuser',
    role: UserRole.ADMIN,
  };

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
      toListItemDtoArray: jest.fn(),
      toDetailDto: jest.fn(),
      toUpdateData: jest.fn(),
      toPackageData: jest.fn(),
    };

    const mockCloudinaryService = {
      uploadImageFromBuffer: jest.fn(),
      deleteImage: jest.fn(),
    };

    const mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    const mockDestinationsService = {
      findById: jest.fn(),
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
        {
          provide: DestinationsService,
          useValue: mockDestinationsService,
        },
      ],
    }).compile();

    service = module.get<PackagesService>(PackagesService);
    repository = module.get(PackagesRepository);
    mapper = module.get(PackagesMapper);
    cloudinaryService = module.get(CloudinaryService);
    logger = module.get(AppLogger);
    destinationsService = module.get(DestinationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
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

      destinationsService.findById.mockResolvedValue({} as any);
      mapper.toPackageData.mockReturnValue(packageData);
      cloudinaryService.uploadImageFromBuffer.mockResolvedValue(uploadResult);
      repository.create.mockResolvedValue(mockPackageDoc);
      mapper.toDetailDto.mockReturnValue(expectedDetailDto);

      // Act
      const result = await service.create(mockCreateDto, mockUser, mockFile);

      // Assert
      expect(destinationsService.findById).toHaveBeenCalledWith(
        mockCreateDto.destinationId,
      );
      expect(cloudinaryService.uploadImageFromBuffer).toHaveBeenCalledWith(
        mockFile.buffer,
        'packages',
      );
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ image: uploadResult }),
      );
      expect(result).toEqual(expectedDetailDto);
    });

    it('should throw InternalServerErrorException if image is not provided', async () => {
      destinationsService.findById.mockResolvedValue({} as any);
      await expect(service.create(mockCreateDto, mockUser)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw NotFoundException if destination does not exist', async () => {
      destinationsService.findById.mockRejectedValue(
        new NotFoundException('Destination not found'),
      );

      await expect(
        service.create(mockCreateDto, mockUser, mockFile),
      ).rejects.toThrow(NotFoundException);
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
          image: {
            url: 'https://example.com/image.jpg',
            publicId: 'packages/test-image',
          },
          groupSize: 10,
          price: 1000,
        },
      ];
      const total = 1;

      destinationsService.findById.mockResolvedValue({} as any);
      repository.findByDestinationId.mockResolvedValue({
        packages: mockPackages,
        total,
      });
      mapper.toListItemDtoArray.mockReturnValue(mockListItems);

      // Act
      const result = await service.findByDestinationId(queryDto);

      // Assert
      expect(destinationsService.findById).toHaveBeenCalledWith(
        mockDestinationId,
      );
      expect(repository.findByDestinationId).toHaveBeenCalledWith(
        mockDestinationId,
        1,
        10,
      );
      expect(mapper.toListItemDtoArray).toHaveBeenCalledWith(mockPackages);
      expect(result.items).toEqual(mockListItems);
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
      const result = await service.update(mockPackageId, updateDto, mockUser);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(mockPackageId);
      expect(repository.updateById).toHaveBeenCalledWith(
        mockPackageId,
        updateData,
      );
      expect(result).toEqual(expectedDetailDto);
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
      const result = await service.update(
        mockPackageId,
        updateDto,
        mockUser,
        mockFile,
      );

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
  });

  describe('delete', () => {
    it('should delete package successfully', async () => {
      // Arrange
      repository.findById.mockResolvedValue(mockPackageDoc);
      cloudinaryService.deleteImage.mockResolvedValue(undefined);
      repository.deleteById.mockResolvedValue(mockPackageDoc);

      // Act
      const result = await service.delete(mockPackageId, mockUser);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(mockPackageId);
      expect(cloudinaryService.deleteImage).toHaveBeenCalledWith(
        mockPackageDoc.image.publicId,
      );
      expect(repository.deleteById).toHaveBeenCalledWith(mockPackageId);
      expect(result).toEqual({ message: 'Package deleted successfully' });
    });
  });
});
