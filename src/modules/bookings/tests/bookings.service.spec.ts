import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from '@/modules/bookings/bookings.service';
import { BookingsRepository } from '@/modules/bookings/bookings.repository';
import { BookingsMapper } from '@/modules/bookings/mappers/bookings.mapper';
import { AppLogger } from '@/common/logger/app-logger.service';
import { BookingContactService } from '@/modules/bookings/booking-contact/booking-contact.service';
import { PackagesService } from '@/modules/packages/packages.service';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { BookingStatus } from '@/modules/bookings/enums/booking-status.enum';
import { UserRole } from '@/modules/users/enums/user-role.enum';

/**
 * BookingsService Unit Tests
 * Tests all business logic scenarios including success cases and error handling
 */
describe('BookingsService', () => {
  let service: BookingsService;
  let repository: jest.Mocked<BookingsRepository>;
  let mapper: jest.Mocked<BookingsMapper>;
  let logger: jest.Mocked<AppLogger>;
  let bookingContactService: jest.Mocked<BookingContactService>;
  let packagesService: jest.Mocked<PackagesService>;

  const mockAdmin = {
    id: 'admin1',
    email: 'admin@test.com',
    userName: 'admin',
    role: UserRole.ADMIN,
  };

  const mockUser = {
    id: 'user1',
    email: 'user@test.com',
    userName: 'user1',
    role: UserRole.NORMAL_USER,
  };

  const mockBookingId = new Types.ObjectId().toString();
  const mockPackageId = new Types.ObjectId().toString();
  const mockContactId = new Types.ObjectId().toString();

  const mockCreateDto = {
    packageId: mockPackageId,
    numberOfPeople: 2,
    totalPrice: 2000,
    contact: {
      name: 'John Doe',
      email: 'john@test.com',
      phone: '1234567890',
    },
  };

  const mockBookingDoc = {
    _id: new Types.ObjectId(mockBookingId),
    userId: new Types.ObjectId(mockUser.id),
    contactId: new Types.ObjectId(mockContactId),
    packageId: new Types.ObjectId(mockPackageId),
    numberOfPeople: 2,
    totalPrice: 2000,
    status: BookingStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  const mockContactDoc = {
    _id: new Types.ObjectId(mockContactId),
    name: 'John Doe',
    email: 'john@test.com',
    phone: '1234567890',
    userId: new Types.ObjectId(mockUser.id),
  } as any;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
    };

    const mockMapper = {
      toListItemDtoArray: jest.fn(),
      toDetailDto: jest.fn(),
      toBookingData: jest.fn(),
      toUpdateData: jest.fn(),
    };

    const mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    const mockBookingContactService = {
      create: jest.fn(),
      findById: jest.fn(),
    };

    const mockPackagesService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: BookingsRepository,
          useValue: mockRepository,
        },
        {
          provide: BookingsMapper,
          useValue: mockMapper,
        },
        {
          provide: AppLogger,
          useValue: mockLogger,
        },
        {
          provide: BookingContactService,
          useValue: mockBookingContactService,
        },
        {
          provide: PackagesService,
          useValue: mockPackagesService,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    repository = module.get(BookingsRepository);
    mapper = module.get(BookingsMapper);
    logger = module.get(AppLogger);
    bookingContactService = module.get(BookingContactService);
    packagesService = module.get(PackagesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a booking successfully', async () => {
      const bookingData = {
        userId: mockUser.id,
        contactId: mockContactId,
        packageId: mockPackageId,
        numberOfPeople: 2,
        totalPrice: 2000,
      };
      const expectedDetailDto = {
        id: mockBookingId,
        ...mockBookingDoc,
      };

      packagesService.findById.mockResolvedValue({} as any);
      bookingContactService.create.mockResolvedValue(mockContactDoc);
      mapper.toBookingData.mockReturnValue(bookingData as any);
      repository.create.mockResolvedValue(mockBookingDoc);
      mapper.toDetailDto.mockReturnValue(expectedDetailDto);

      const result = await service.create(mockCreateDto, mockUser);

      expect(packagesService.findById).toHaveBeenCalledWith(mockPackageId);
      expect(bookingContactService.create).toHaveBeenCalledWith({
        name: mockCreateDto.contact.name,
        email: mockCreateDto.contact.email,
        phone: mockCreateDto.contact.phone,
        userId: mockUser.id,
      });
      expect(repository.create).toHaveBeenCalled();
      expect(result).toEqual(expectedDetailDto);
    });

    it('should throw BadRequestException if package does not exist', async () => {
      packagesService.findById.mockRejectedValue(
        new NotFoundException('Package not found'),
      );

      await expect(service.create(mockCreateDto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException on repository error', async () => {
      packagesService.findById.mockResolvedValue({} as any);
      bookingContactService.create.mockResolvedValue(mockContactDoc);
      mapper.toBookingData.mockReturnValue({} as any);
      repository.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(mockCreateDto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated bookings for admin', async () => {
      const queryDto = {
        page: 1,
        limit: 10,
      };
      const mockBookings = [mockBookingDoc];
      const mockListItems = [
        {
          id: mockBookingId,
          userId: mockUser.id,
          contactId: mockContactId,
          packageId: mockPackageId,
          numberOfPeople: 2,
          totalPrice: 2000,
          status: BookingStatus.PENDING,
        },
      ];
      const total = 1;

      repository.findAll.mockResolvedValue({
        bookings: mockBookings,
        total,
      });
      mapper.toListItemDtoArray.mockReturnValue(mockListItems);

      const result = await service.findAll(queryDto, mockAdmin);

      expect(repository.findAll).toHaveBeenCalled();
      expect(result.items).toEqual(mockListItems);
      expect(result.meta.total).toBe(total);
    });

    it('should filter by userId for non-admin users', async () => {
      const queryDto = {
        page: 1,
        limit: 10,
      };
      const mockBookings = [mockBookingDoc];
      const mockListItems = [
        {
          id: mockBookingId,
          userId: mockUser.id,
          contactId: mockContactId,
          packageId: mockPackageId,
          numberOfPeople: 2,
          totalPrice: 2000,
          status: BookingStatus.PENDING,
        },
      ];
      const total = 1;

      repository.findAll.mockResolvedValue({
        bookings: mockBookings,
        total,
      });
      mapper.toListItemDtoArray.mockReturnValue(mockListItems);

      const result = await service.findAll(queryDto, mockUser);

      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ userId: expect.anything() }),
        1,
        10,
      );
      expect(result.items).toEqual(mockListItems);
    });

    it('should throw InternalServerErrorException on error', async () => {
      const queryDto = {
        page: 1,
        limit: 10,
      };

      repository.findAll.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll(queryDto, mockUser)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findById', () => {
    it('should return booking details when found', async () => {
      const expectedDetailDto = {
        id: mockBookingId,
        ...mockBookingDoc,
      };

      repository.findById.mockResolvedValue(mockBookingDoc);
      mapper.toDetailDto.mockReturnValue(expectedDetailDto);

      const result = await service.findById(mockBookingId, mockUser);

      expect(repository.findById).toHaveBeenCalledWith(mockBookingId);
      expect(result).toEqual(expectedDetailDto);
    });

    it('should throw NotFoundException if booking not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.findById(mockBookingId, mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user tries to access other user booking', async () => {
      const otherUserBooking = {
        ...mockBookingDoc,
        userId: new Types.ObjectId('otherUserId'),
      };

      repository.findById.mockResolvedValue(otherUserBooking);

      await expect(
        service.findById(mockBookingId, mockUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to access any booking', async () => {
      const expectedDetailDto = {
        id: mockBookingId,
        ...mockBookingDoc,
      };

      repository.findById.mockResolvedValue(mockBookingDoc);
      mapper.toDetailDto.mockReturnValue(expectedDetailDto);

      const result = await service.findById(mockBookingId, mockAdmin);

      expect(result).toEqual(expectedDetailDto);
    });

    it('should throw InternalServerErrorException on error', async () => {
      repository.findById.mockRejectedValue(new Error('Database error'));

      await expect(
        service.findById(mockBookingId, mockUser),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    it('should update booking successfully', async () => {
      const updateDto = {
        numberOfPeople: 3,
        totalPrice: 3000,
      };
      const updateData = {
        numberOfPeople: 3,
        totalPrice: 3000,
      };
      const updatedBooking = {
        ...mockBookingDoc,
        numberOfPeople: 3,
        totalPrice: 3000,
      };
      const expectedDetailDto = {
        id: mockBookingId,
        ...updatedBooking,
      };

      repository.findById.mockResolvedValue(mockBookingDoc);
      mapper.toUpdateData.mockReturnValue(updateData);
      repository.updateById.mockResolvedValue(updatedBooking);
      mapper.toDetailDto.mockReturnValue(expectedDetailDto);

      const result = await service.update(mockBookingId, updateDto, mockUser);

      expect(repository.findById).toHaveBeenCalledWith(mockBookingId);
      expect(repository.updateById).toHaveBeenCalledWith(
        mockBookingId,
        updateData,
      );
      expect(result).toEqual(expectedDetailDto);
    });

    it('should validate package if packageId is being updated', async () => {
      const updateDto = {
        packageId: 'newPackageId',
      };
      const updateData = {
        packageId: 'newPackageId',
      };
      const updatedBooking = {
        ...mockBookingDoc,
        packageId: 'newPackageId',
      };
      const expectedDetailDto = {
        id: mockBookingId,
        ...updatedBooking,
      };

      repository.findById.mockResolvedValue(mockBookingDoc);
      packagesService.findById.mockResolvedValue({} as any);
      mapper.toUpdateData.mockReturnValue(updateData);
      repository.updateById.mockResolvedValue(updatedBooking);
      mapper.toDetailDto.mockReturnValue(expectedDetailDto);

      await service.update(mockBookingId, updateDto, mockUser);

      expect(packagesService.findById).toHaveBeenCalledWith('newPackageId');
    });

    it('should throw NotFoundException if booking not found', async () => {
      const updateDto = {
        numberOfPeople: 3,
      };

      repository.findById.mockResolvedValue(null);

      await expect(
        service.update(mockBookingId, updateDto, mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user tries to update other user booking', async () => {
      const updateDto = {
        numberOfPeople: 3,
      };
      const otherUserBooking = {
        ...mockBookingDoc,
        userId: new Types.ObjectId('otherUserId'),
      };

      repository.findById.mockResolvedValue(otherUserBooking);

      await expect(
        service.update(mockBookingId, updateDto, mockUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException on error', async () => {
      const updateDto = {
        numberOfPeople: 3,
      };

      repository.findById.mockResolvedValue(mockBookingDoc);
      mapper.toUpdateData.mockReturnValue({});
      repository.updateById.mockRejectedValue(new Error('Database error'));

      await expect(
        service.update(mockBookingId, updateDto, mockUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete booking successfully', async () => {
      repository.findById.mockResolvedValue(mockBookingDoc);
      repository.deleteById.mockResolvedValue(mockBookingDoc);

      const result = await service.delete(mockBookingId);

      expect(repository.findById).toHaveBeenCalledWith(mockBookingId);
      expect(repository.deleteById).toHaveBeenCalledWith(mockBookingId);
      expect(result).toEqual({ message: 'Booking deleted successfully' });
    });

    it('should throw NotFoundException if booking not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete(mockBookingId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if delete fails', async () => {
      repository.findById.mockResolvedValue(mockBookingDoc);
      repository.deleteById.mockResolvedValue(null);

      await expect(service.delete(mockBookingId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on error', async () => {
      repository.findById.mockResolvedValue(mockBookingDoc);
      repository.deleteById.mockRejectedValue(new Error('Database error'));

      await expect(service.delete(mockBookingId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});

