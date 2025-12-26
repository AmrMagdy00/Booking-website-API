import { Injectable } from '@nestjs/common';
import { UserDocument } from '@/modules/users/schema/user.schema';
import { UserResponseDto } from '@/modules/users/dtos/user-response.dto';
import {
  AuthUserDto,
  RegisterResponseDto,
  LoginResponseDto,
} from '../dtos/auth-response.dto';
import { JWTPayloadType } from '@/common/auth/types/jwt-payload.type';

/**
 * AuthMapper - Mapper layer for transforming between schemas and DTOs
 * Handles all data transformation logic for authentication responses
 */
@Injectable()
export class AuthMapper {
  /**
   * Converts UserDocument or UserResponseDto to AuthUserDto
   */
  toAuthUserDto(
    user:
      | UserDocument
      | UserResponseDto
      | { _id: string; userName: string; email: string; role: any },
  ): AuthUserDto {
    return {
      _id: typeof user._id === 'string' ? user._id : user._id.toString(),
      userName: user.userName,
      email: user.email,
    };
  }

  /**
   * Converts UserResponseDto to RegisterResponseDto
   */
  toRegisterResponseDto(user: UserResponseDto): RegisterResponseDto {
    return {
      user: this.toAuthUserDto(user),
    };
  }

  /**
   * Converts UserDocument and token to LoginResponseDto
   */
  toLoginResponseDto(user: UserDocument, token: string): LoginResponseDto {
    return {
      user: this.toAuthUserDto(user),
      token,
    };
  }

  /**
   * Converts UserDocument to JWTPayloadType
   */
  toJWTPayload(user: UserDocument): JWTPayloadType {
    return {
      id: user._id.toString(),
      email: user.email,
      userName: user.userName,
      role: user.role,
    };
  }
}
