import { UserRole } from '../enums/user-role.enum';

export class UserResponseDto {
  _id: string;
  userName: string;
  email: string;
  role: UserRole;
  isAccountVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
