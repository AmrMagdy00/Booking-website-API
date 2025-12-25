import { Injectable } from '@nestjs/common';
import { User, UserDocument } from './schema/user.schema';
import { UserResponseDto } from './dtos/user-response.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersMapper {
  toResponseDto(user: UserDocument): UserResponseDto {
    return {
      _id: user._id.toString(),
      userName: user.userName,
      email: user.email,
      role: user.role,
      isAccountVerified: user.isAccountVerified,
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt,
    };
  }

  toResponseDtoArray(users: UserDocument[]): UserResponseDto[] {
    return users.map((user) => this.toResponseDto(user));
  }

  toPersistence(dto: CreateUserDto): Partial<User> {
    return {
      userName: dto.userName,
      email: dto.email.toLowerCase(),
      password: dto.password,
      role: dto.role,
    };
  }

  toUpdatePersistence(dto: UpdateUserDto): Partial<User> {
    const updateData: Partial<User> = {};
    if (dto.userName) updateData.userName = dto.userName;
    if (dto.email) updateData.email = dto.email.toLowerCase();
    if (dto.password) updateData.password = dto.password; 
    if (dto.role) updateData.role = dto.role;
    return updateData;
  }
}
