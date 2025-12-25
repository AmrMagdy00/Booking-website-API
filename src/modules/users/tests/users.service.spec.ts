import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { UsersRepository } from '../users.repository';
import { UsersMapper } from '../users.mapper';
import { AppLogger } from '@/common/logger/app-logger.service';
import { UserRole } from '../enums/user-role.enum';
import { ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;
  let mapper: jest.Mocked<UsersMapper>;
  let logger: jest.Mocked<AppLogger>;

  const mockAdmin = { id: 'admin1', email: 'admin@test.com', userName: 'admin', role: UserRole.ADMIN };
  const mockUser = { id: 'user1', email: 'user@test.com', userName: 'user1', role: UserRole.NORMAL_USER };
  const otherUser = { id: 'user2', email: 'other@test.com', userName: 'user2', role: UserRole.NORMAL_USER };

  const mockUserDoc = {
    _id: 'user1',
    userName: 'testuser',
    email: 'user@test.com',
    role: UserRole.NORMAL_USER,
    password: 'hashedPassword',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findByEmailWithPassword: jest.fn(),
            create: jest.fn(),
            updateById: jest.fn(),
            deleteById: jest.fn(),
          },
        },
        {
          provide: UsersMapper,
          useValue: {
            toResponseDtoArray: jest.fn(),
            toResponseDto: jest.fn(),
            toPersistence: jest.fn(),
            toUpdatePersistence: jest.fn(),
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

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository) as any;
    mapper = module.get(UsersMapper) as any;
    logger = module.get(AppLogger) as any;

    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
  });

  describe('findById', () => {
    it('should allow Admin to find any user', async () => {
      repository.findById.mockResolvedValue(mockUserDoc as any);
      mapper.toResponseDto.mockReturnValue(mockUserDoc as any);

      const result = await service.findById('user2', mockAdmin as any);
      expect(result).toBeDefined();
    });

    it('should allow User to find themselves', async () => {
      repository.findById.mockResolvedValue(mockUserDoc as any);
      mapper.toResponseDto.mockReturnValue(mockUserDoc as any);

      const result = await service.findById('user1', mockUser as any);
      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException if User tries to find others', async () => {
      await expect(service.findById('user2', mockUser as any)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    const createDto = { userName: 'new', email: 'new@test.com', password: 'password123' };

    it('should create a user and hash password', async () => {
      repository.findByEmail.mockResolvedValue(null);
      mapper.toPersistence.mockReturnValue({ ...createDto } as any);
      repository.create.mockResolvedValue(mockUserDoc as any);
      mapper.toResponseDto.mockReturnValue(mockUserDoc as any);

      await service.create(createDto as any);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      expect(repository.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      repository.findByEmail.mockResolvedValue(mockUserDoc as any);
      await expect(service.create(createDto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should allow owner to update their profile', async () => {
      repository.findById.mockResolvedValue(mockUserDoc as any);
      mapper.toUpdatePersistence.mockReturnValue({ userName: 'updated' } as any);
      repository.updateById.mockResolvedValue({ ...mockUserDoc, userName: 'updated' } as any);

      await service.update('user1', { userName: 'updated' }, mockUser as any);
      expect(repository.updateById).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if non-owner/non-admin tries to update', async () => {
      await expect(service.update('user2', {}, mockUser as any)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should allow Admin to delete any user', async () => {
      repository.deleteById.mockResolvedValue(mockUserDoc as any);
      await service.delete('user2', mockAdmin as any);
      expect(repository.deleteById).toHaveBeenCalledWith('user2');
    });

    it('should throw ForbiddenException if user tries to delete another', async () => {
      await expect(service.delete('user2', mockUser as any)).rejects.toThrow(ForbiddenException);
    });
  });
});
