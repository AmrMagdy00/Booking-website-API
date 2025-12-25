import { Test, TestingModule } from '@nestjs/testing';
import { DestinationsService } from '../destinations.service';
import { DestinationsRepository } from '../destinations.repository';
import { DestinationsMapper } from '../mappers/destinations.mapper';
import { CloudinaryService } from '@/shared/services/cloudinary.service';
import { AppLogger } from '@/common/logger/app-logger.service';
import { Types } from 'mongoose';
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UserRole } from '@/modules/users/enums/user-role.enum';

describe('DestinationsService', () => {
  let service: DestinationsService;
  let repository: jest.Mocked<DestinationsRepository>;
  let mapper: jest.Mocked<DestinationsMapper>;
  let cloudinary: jest.Mocked<CloudinaryService>;
  let logger: jest.Mocked<AppLogger>;

  const mockUser = {
    id: 'user123',
    email: 'admin@test.com',
    userName: 'adminuser',
    role: UserRole.ADMIN,
  };

  const mockDestinationId = new Types.ObjectId().toString();
  const mockDestinationDoc = {
    _id: new Types.ObjectId(mockDestinationId),
    name: 'Paris',
    description: 'City of light',
    location: 'France',
    image: { url: 'old-url', publicId: 'old-id' },
    packages: [],
    save: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DestinationsService,
        {
          provide: DestinationsRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            updateById: jest.fn(),
            deleteById: jest.fn(),
          },
        },
        {
          provide: DestinationsMapper,
          useValue: {
            toListItemDtoArray: jest.fn(),
            toDetailDto: jest.fn(),
            toPersistence: jest.fn(),
            toUpdatePersistence: jest.fn(),
          },
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadImageFromBuffer: jest.fn(),
            deleteImage: jest.fn(),
          },
        },
        {
          provide: AppLogger,
          useValue: {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DestinationsService>(DestinationsService);
    repository = module.get(DestinationsRepository) as any;
    mapper = module.get(DestinationsMapper) as any;
    cloudinary = module.get(CloudinaryService) as any;
    logger = module.get(AppLogger) as any;
  });

  describe('findAll', () => {
    it('should return paginated destinations', async () => {
      const mockItems = [mockDestinationDoc];
      const mockMeta = { total: 1, page: 1, limit: 10, totalPages: 1 };
      repository.findAll.mockResolvedValue({ destinations: mockItems, total: 1 });
      mapper.toListItemDtoArray.mockReturnValue(mockItems as any);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toEqual(mockItems);
      expect(result.meta).toEqual(mockMeta);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on database error', async () => {
      repository.findAll.mockRejectedValue(new Error('DB Error'));
      await expect(service.findAll({})).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findById', () => {
    it('should return destination when found', async () => {
      repository.findById.mockResolvedValue(mockDestinationDoc);
      mapper.toDetailDto.mockReturnValue(mockDestinationDoc as any);

      const result = await service.findById(mockDestinationId);

      expect(result).toBeDefined();
      expect(repository.findById).toHaveBeenCalledWith(mockDestinationId);
    });

    it('should throw NotFoundException when not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById(mockDestinationId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = { name: 'Paris', description: 'City', location: 'France' };
    const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;

    it('should create destination with image', async () => {
      mapper.toPersistence.mockReturnValue({ ...createDto } as any);
      cloudinary.uploadImageFromBuffer.mockResolvedValue({ url: 'new-url', publicId: 'new-id' });
      repository.create.mockResolvedValue(mockDestinationDoc);
      mapper.toDetailDto.mockReturnValue(mockDestinationDoc as any);

      const result = await service.create(createDto as any, mockUser, mockFile);

      expect(result).toBeDefined();
      expect(cloudinary.uploadImageFromBuffer).toHaveBeenCalledWith(mockFile.buffer, 'destinations');
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
        image: { url: 'new-url', publicId: 'new-id' }
      }));
    });

    it('should throw BadRequestException if creation fails', async () => {
      cloudinary.uploadImageFromBuffer.mockRejectedValue(new Error('fail'));
      await expect(service.create(createDto as any, mockUser, mockFile)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    const updateDto = { name: 'New Paris' };

    it('should update destination without changing image', async () => {
      repository.findById.mockResolvedValue(mockDestinationDoc);
      mapper.toUpdatePersistence.mockReturnValue({ ...updateDto } as any);
      repository.updateById.mockResolvedValue({ ...mockDestinationDoc, ...updateDto });
      mapper.toDetailDto.mockReturnValue({ ...mockDestinationDoc, ...updateDto } as any);

      const result = await service.update(mockDestinationId, updateDto, mockUser);

      expect(result).toBeDefined();
      expect(cloudinary.deleteImage).not.toHaveBeenCalled();
      expect(repository.updateById).toHaveBeenCalledWith(mockDestinationId, expect.not.objectContaining({ image: expect.anything() }));
    });

    it('should update destination and replace image if file provided', async () => {
      const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;
      repository.findById.mockResolvedValue(mockDestinationDoc);
      mapper.toUpdatePersistence.mockReturnValue({ ...updateDto } as any);
      cloudinary.uploadImageFromBuffer.mockResolvedValue({ url: 'new-url', publicId: 'new-id' });
      repository.updateById.mockResolvedValue({ ...mockDestinationDoc, ...updateDto, image: { url: 'new-url', publicId: 'new-id' } });

      await service.update(mockDestinationId, updateDto, mockUser, mockFile);

      expect(cloudinary.deleteImage).toHaveBeenCalledWith(mockDestinationDoc.image.publicId);
      expect(cloudinary.uploadImageFromBuffer).toHaveBeenCalled();
      expect(repository.updateById).toHaveBeenCalledWith(mockDestinationId, expect.objectContaining({
        image: { url: 'new-url', publicId: 'new-id' }
      }));
    });

    it('should throw NotFoundException if destination doesn\'t exist', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.update(mockDestinationId, {}, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete destination and its image', async () => {
      repository.findById.mockResolvedValue(mockDestinationDoc);
      repository.deleteById.mockResolvedValue(mockDestinationDoc);

      const result = await service.delete(mockDestinationId, mockUser);

      expect(result).toEqual({ message: 'Destination deleted successfully' });
      expect(cloudinary.deleteImage).toHaveBeenCalledWith(mockDestinationDoc.image.publicId);
      expect(repository.deleteById).toHaveBeenCalledWith(mockDestinationId);
    });

    it('should continue deletion even if image deletion fails', async () => {
      repository.findById.mockResolvedValue(mockDestinationDoc);
      cloudinary.deleteImage.mockRejectedValue(new Error('fail'));
      repository.deleteById.mockResolvedValue(mockDestinationDoc);

      const result = await service.delete(mockDestinationId, mockUser);

      expect(result.message).toBeDefined();
      expect(logger.error).toHaveBeenCalled();
      expect(repository.deleteById).toHaveBeenCalled();
    });
  });
});
