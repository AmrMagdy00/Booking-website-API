import { Test, TestingModule } from '@nestjs/testing';
import { DestinationsController } from '../destinations.controller';
import { DestinationsService } from '../destinations.service';
import { UserRole } from '@/modules/users/enums/user-role.enum';

describe('DestinationsController', () => {
  let controller: DestinationsController;
  let service: jest.Mocked<DestinationsService>;

  const mockUser = {
    id: 'user123',
    email: 'admin@test.com',
    userName: 'adminuser',
    role: UserRole.ADMIN,
  };

  const mockDestination = {
    id: 'dest123',
    name: 'Paris',
    description: 'City of light',
    location: 'France',
    image: { url: 'old-url', publicId: 'old-id' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DestinationsController],
      providers: [
        {
          provide: DestinationsService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DestinationsController>(DestinationsController);
    service = module.get(DestinationsService) as any;
  });

  describe('findAll', () => {
    it('should return paginated destinations in standard format', async () => {
      const mockResult = { 
        items: [mockDestination], 
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 } 
      };
      service.findAll.mockResolvedValue(mockResult as any);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult.items);
      expect(result.meta).toEqual(mockResult.meta);
    });
  });

  describe('findById', () => {
    it('should return destination details in success format', async () => {
      service.findById.mockResolvedValue(mockDestination as any);

      const result = await controller.findById('dest123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDestination);
      expect(result.message).toContain('successfully');
    });
  });

  describe('create', () => {
    it('should create a new destination and return success', async () => {
      const createDto = { name: 'Paris', description: 'City', location: 'France' };
      const mockFile = {} as Express.Multer.File;
      service.create.mockResolvedValue(mockDestination as any);

      const result = await controller.create(createDto as any, mockUser, mockFile);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDestination);
      expect(service.create).toHaveBeenCalledWith(createDto, mockUser, mockFile);
    });
  });

  describe('update', () => {
    it('should update an existing destination and return success', async () => {
      const updateDto = { name: 'New Paris' };
      service.update.mockResolvedValue(mockDestination as any);

      // In controller, update(id, dto, user, file?) -> file is undefined if not passed
      const result = await controller.update('dest123', updateDto as any, mockUser, undefined);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDestination);
      expect(service.update).toHaveBeenCalledWith('dest123', updateDto, mockUser, undefined);
    });
  });

  describe('delete', () => {
    it('should delete a destination and return custom message', async () => {
      const mockResponse = { message: 'Custom deletion message' };
      service.delete.mockResolvedValue(mockResponse as any);

      const result = await controller.delete('dest123', mockUser);

      expect(result.success).toBe(true);
      expect(result.message).toBe(mockResponse.message);
      expect(service.delete).toHaveBeenCalledWith('dest123', mockUser);
    });
  });
});
