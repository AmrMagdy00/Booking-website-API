import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/modules/users/users.service';
import { AuthMapper } from './mappers/auth.mapper';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { CreateUserDto } from '@/modules/users/dtos/create-user.dto';
import {
  RegisterResponseDto,
  LoginResponseDto,
} from './dtos/auth-response.dto';
import { AppLogger } from '@/common/logger/app-logger.service';

/**
 * AuthService - Business logic layer for authentication
 * Handles user registration, login, and JWT token generation
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authMapper: AuthMapper,
    private readonly jwtService: JwtService,
    private readonly logger: AppLogger,
  ) {}

  /**
   * Registers a new user and returns user data
   */
  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    try {
      this.logger.info('Registering new user', { email: dto.email });

      // Create user DTO from register DTO
      const createUserDto: CreateUserDto = {
        userName: dto.userName,
        email: dto.email,
        password: dto.password,
      };

      // Create user through UsersService (handles conflict check internally)
      const userResponse = await this.usersService.create(createUserDto);

      this.logger.info('User registered successfully', {
        userId: userResponse._id,
      });

      // Map to response DTO
      return this.authMapper.toRegisterResponseDto(userResponse);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('Registration failed', { error, email: dto.email });
      throw new InternalServerErrorException('Registration failed');
    }
  }

  /**
   * Authenticates user and returns user data with JWT token
   */
  async login(dto: LoginDto): Promise<LoginResponseDto> {
    try {
      this.logger.info('User login attempt', { email: dto.email });

      // Find user with password through UsersService
      const user = await this.usersService.findByEmailWithPassword(dto.email);
      if (!user) {
        this.logger.warn('Login failed: User not found', {
          email: dto.email,
        });
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        this.logger.warn('Login failed: Invalid password', {
          email: dto.email,
        });
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate JWT token
      const payload = this.authMapper.toJWTPayload(user);
      const token = await this.generateJWT(payload);

      this.logger.info('User logged in successfully', { userId: user._id });

      // Map to response DTO
      return this.authMapper.toLoginResponseDto(user, token);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Login failed with error', { error, email: dto.email });
      throw new InternalServerErrorException('Login failed');
    }
  }

  /**
   * Generates JWT token from payload
   */
  private async generateJWT(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
