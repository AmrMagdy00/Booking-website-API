import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto as RegisterDto } from '../users/dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { JWTPayloadType } from '@/common/auth/types/jwt-payload.type';
import { AppLogger } from '@/common/logger/app-logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly logger: AppLogger,
  ) {}

  async register(dto: RegisterDto) {
    try {
      this.logger.info('Registering new user', { email: dto.email });
      const user = await this.usersService.create(dto);
      
      const payload: JWTPayloadType = {
        id: user._id,
        email: user.email,
        userName: user.userName,
        role: user.role,
      };

      const token = await this.generateJWT(payload);
      
      return { user, token };
    } catch (error) {
      this.logger.error('Registration failed', { error, email: dto.email });
      throw error;
    }
  }

  async login(dto: LoginDto) {
    try {
      this.logger.info('User login attempt', { email: dto.email });
      
      const user = await this.usersService.findByEmailWithPassword(dto.email);
      if (!user) {
        this.logger.warn('Login failed: User not found', { email: dto.email });
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        this.logger.warn('Login failed: Invalid password', { email: dto.email });
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload: JWTPayloadType = {
        id: user._id.toString(),
        email: user.email,
        userName: user.userName,
        role: user.role,
      };

      const token = await this.generateJWT(payload);

      this.logger.info('User logged in successfully', { id: user._id });

      return {
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error('Login failed with error', { error, email: dto.email });
      throw new InternalServerErrorException('Login failed');
    }
  }

  private async generateJWT(payload: JWTPayloadType): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
