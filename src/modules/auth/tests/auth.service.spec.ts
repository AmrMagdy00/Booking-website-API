import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AppLogger } from '@/common/logger/app-logger.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    _id: 'user123',
    email: 'test@test.com',
    userName: 'testuser',
    role: 'NORMAL_USER',
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
    usersService = module.get(UsersService) as any;
    jwtService = module.get(JwtService) as any;
  });

  describe('register', () => {
    it('should register a user and return token', async () => {
      usersService.create.mockResolvedValue(mockUser as any);
      jwtService.signAsync.mockResolvedValue('token123');

      const result = await service.register({ email: 'test@test.com' } as any);

      expect(result.token).toBe('token123');
      expect(usersService.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('token123');

      const result = await service.login({ email: 'test@test.com', password: 'password' });

      expect(result.token).toBe('token123');
      expect(result.user.email).toBe(mockUser.email);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'test@test.com', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(service.login({ email: 'notfound@test.com', password: 'password' })).rejects.toThrow(UnauthorizedException);
    });
  });
});
