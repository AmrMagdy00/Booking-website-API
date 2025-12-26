import { UserRole } from '@/modules/users/enums/user-role.enum';

/**
 * AuthUserDto - User data returned in auth responses
 */
export class AuthUserDto {
  _id: string;
  userName: string;
  email: string;
}

/**
 * RegisterResponseDto - Response after successful registration
 */
export class RegisterResponseDto {
  user: AuthUserDto;
}

/**
 * LoginResponseDto - Response after successful login
 */
export class LoginResponseDto {
  user: AuthUserDto;
  token: string;
}
