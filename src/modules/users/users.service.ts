import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { UsersMapper } from './users.mapper';
import { AppLogger } from '@/common/logger/app-logger.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { QueryUserDto } from './dtos/query-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { UserDocument } from './schema/user.schema';
import { UserRole } from './enums/user-role.enum';
import { JWTPayloadType } from '@/common/auth/types/jwt-payload.type';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersMapper: UsersMapper,
    private readonly logger: AppLogger,
  ) {}

  
  async findAll(queryDto: QueryUserDto, currentUser: JWTPayloadType): Promise<{
    items: UserResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    try {
      const page = queryDto.page || 1;
      const limit = queryDto.limit || 10;
      
      this.logger.info('Admin fetching users', { 
        actorId: currentUser.id,
        page, 
        limit 
      });
      
      const query: any = {};
      if (queryDto.userName) {
        query.userName = { $regex: queryDto.userName, $options: 'i' };
      }
      if (queryDto.email) {
        query.email = { $regex: queryDto.email, $options: 'i' };
      }
      
      const { users, total } = await this.usersRepository.findAll(
        query,
        page,
        limit,
      );
      
      const items = this.usersMapper.toResponseDtoArray(users);
      const totalPages = Math.ceil(total / limit);
      
      return {
        items,
        meta: { page, limit, total, totalPages },
      };
    } catch (error) {
      this.logger.error('Failed to fetch users', { error });
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }
  
  async findById(id: string, currentUser: JWTPayloadType): Promise<UserResponseDto> {
    try {
      this.logger.info('Fetching user by ID', { id, actor: currentUser.id });

      if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
        throw new ForbiddenException('You are not allowed to view this profile');
      }

      const user = await this.usersRepository.findById(id);
      if (!user) {
        this.logger.warn('User not found', { id });
        throw new NotFoundException('User not found');
      }
      
      return this.usersMapper.toResponseDto(user);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      this.logger.error('Failed to fetch user', { error, id });
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }
  
  async create(dto: CreateUserDto, currentUser?: JWTPayloadType): Promise<UserResponseDto> {
    try {
      this.logger.info(currentUser ? 'Admin creating new user' : 'Public self-registration', { 
        email: dto.email, 
        actorId: currentUser?.id 
      });

      const existingUser = await this.usersRepository.findByEmail(dto.email);
      if (existingUser) {
        this.logger.warn('Email already exists', { email: dto.email });
        throw new ConflictException('Email already exists');
      }

      const userData = this.usersMapper.toPersistence(dto);
      
      userData.password = await this.hashPassword(dto.password);

      const createdUser = await this.usersRepository.create(userData);

      this.logger.info('User created successfully', { id: createdUser._id });
      return this.usersMapper.toResponseDto(createdUser);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      this.logger.error('Failed to create user', { error, dto });
      throw new InternalServerErrorException('Failed to create user');
    }
  }
 
  async getCurrentUser(id: string): Promise<UserDocument | null> {
    return this.usersRepository.findById(id);
  }

  
  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.usersRepository.findByEmailWithPassword(email);
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    currentUser: JWTPayloadType,
  ): Promise<UserResponseDto> {
    try {
      this.logger.info('Updating user', { id, actor: currentUser.id });

      if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
        throw new ForbiddenException('You are not allowed to update this profile');
      }

      const existingUser = await this.usersRepository.findById(id);
      if (!existingUser) {
        this.logger.warn('User not found for update', { id });
        throw new NotFoundException('User not found');
      }

      const updateData = this.usersMapper.toUpdatePersistence(dto);
      
      if (dto.password) {
        updateData.password = await this.hashPassword(dto.password);
      }

      const updatedUser = await this.usersRepository.updateById(id, updateData);
      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      this.logger.info('User updated successfully', { id });
      return this.usersMapper.toResponseDto(updatedUser);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      this.logger.error('Failed to update user', { error, id, dto });
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async delete(id: string, currentUser: JWTPayloadType): Promise<{ message: string }> {
    try {
      this.logger.info('Deleting user', { id, actor: currentUser.id });

      if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
        throw new ForbiddenException('You are not allowed to delete this profile');
      }

      const deletedUser = await this.usersRepository.deleteById(id);
      if (!deletedUser) {
        this.logger.warn('User not found for deletion', { id });
        throw new NotFoundException('User not found');
      }

      this.logger.info('User deleted successfully', { id });
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      this.logger.error('Failed to delete user', { error, id });
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
}
