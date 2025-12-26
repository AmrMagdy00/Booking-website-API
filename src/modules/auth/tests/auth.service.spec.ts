import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@/modules/auth/auth.service';
import { UsersService } from '@/modules/users/users.service';
import { AuthMapper } from '@/modules/auth/mappers/auth.mapper';
import { JwtService } from '@nestjs/jwt';
import { AppLogger } from '@/common/logger/app-logger.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserRole } from '@/modules/users/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let authMapper: jest.Mocked<AuthMapper>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    _id: 'user123',
    email: 'test@test.com',
    userName: 'testuser',
    role: UserRole.NORMAL_USER,
    password: 'hashedPassword',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmailWithPassword: jest.fn(),
          },
        },
        {
          provide: AuthMapper,
          useValue: {
            toRegisterResponseDto: jest.fn(),
            toLoginResponseDto: jest.fn(),
            toJWTPayload: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
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

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    authMapper = module.get(AuthMapper);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('should register a user and return user data', async () => {
      usersService.create.mockResolvedValue({
        _id: mockUser._id,
        email: mockUser.email,
        userName: mockUser.userName,
        role: mockUser.role,
      } as any);
      authMapper.toRegisterResponseDto.mockReturnValue({
        user: {
          _id: mockUser._id,
          email: mockUser.email,
          userName: mockUser.userName,
          role: mockUser.role,
        },
      } as any);

      const result = await service.register({
        email: 'test@test.com',
        userName: 'testuser',
        password: 'password123',
      } as any);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(mockUser.email);
      expect(usersService.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      usersService.create.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      await expect(
        service.register({
          email: 'test@test.com',
          userName: 'testuser',
          password: 'password123',
        } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      authMapper.toJWTPayload.mockReturnValue({
        id: mockUser._id,
        email: mockUser.email,
        userName: mockUser.userName,
        role: mockUser.role,
      });
      jwtService.signAsync.mockResolvedValue('token123');
      authMapper.toLoginResponseDto.mockReturnValue({
        user: {
          _id: mockUser._id,
          email: mockUser.email,
          userName: mockUser.userName,
          role: mockUser.role,
        },
        token: 'token123',
      } as any);

      const result = await service.login({
        email: 'test@test.com',
        password: 'password',
      });

      expect(result.token).toBe('token123');
      expect(result.user.email).toBe(mockUser.email);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'notfound@test.com',
          password: 'password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
