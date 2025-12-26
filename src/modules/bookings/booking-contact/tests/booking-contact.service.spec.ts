import { Test, TestingModule } from '@nestjs/testing';
import { BookingContactService } from '@/modules/bookings/booking-contact/booking-contact.service';
import { BookingContactRepository } from '@/modules/bookings/booking-contact/booking-contact.repository';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

/**
 * BookingContactService Unit Tests
 * Tests all business logic scenarios including success cases and error handling
 */
describe('BookingContactService', () => {
  let service: BookingContactService;
  let repository: jest.Mocked<BookingContactRepository>;

  const mockContactId = new Types.ObjectId().toString();
  const mockUserId = new Types.ObjectId().toString();

  const mockContactData = {
    name: 'John Doe',
    email: 'john@test.com',
    phone: '1234567890',
    userId: mockUserId,
  };

  const mockContactDoc = {
    _id: new Types.ObjectId(mockContactId),
    name: 'John Doe',
    email: 'john@test.com',
    phone: '1234567890',
    userId: new Types.ObjectId(mockUserId),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingContactService,
        {
          provide: BookingContactRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BookingContactService>(BookingContactService);
    repository = module.get(BookingContactRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a booking contact successfully with userId', async () => {
      repository.create.mockResolvedValue(mockContactDoc);

      const result = await service.create(mockContactData);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockContactData.name,
          email: mockContactData.email,
          phone: mockContactData.phone,
          userId: expect.anything(),
        }),
      );
      expect(result).toEqual(mockContactDoc);
    });

    it('should create a booking contact successfully without userId', async () => {
      const contactDataWithoutUserId = {
        name: 'Jane Doe',
        email: 'jane@test.com',
        phone: '0987654321',
      };
      const contactDocWithoutUserId = {
        ...mockContactDoc,
        userId: undefined,
      };

      repository.create.mockResolvedValue(contactDocWithoutUserId);

      const result = await service.create(contactDataWithoutUserId);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: contactDataWithoutUserId.name,
          email: contactDataWithoutUserId.email,
          phone: contactDataWithoutUserId.phone,
        }),
      );
      expect(result).toEqual(contactDocWithoutUserId);
    });

    it('should convert userId string to ObjectId', async () => {
      repository.create.mockResolvedValue(mockContactDoc);

      await service.create(mockContactData);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: expect.any(Types.ObjectId),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return booking contact when found', async () => {
      repository.findById.mockResolvedValue(mockContactDoc);

      const result = await service.findById(mockContactId);

      expect(repository.findById).toHaveBeenCalledWith(mockContactId);
      expect(result).toEqual(mockContactDoc);
    });

    it('should throw NotFoundException if contact not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById(mockContactId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findById).toHaveBeenCalledWith(mockContactId);
    });

    it('should throw NotFoundException with correct message', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById(mockContactId)).rejects.toThrow(
        'Booking contact not found',
      );
    });
  });
});

