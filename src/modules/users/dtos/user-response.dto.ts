import { UserRole } from '@/modules/users/enums/user-role.enum';

export class UserResponseDto {
  _id: string;
  userName: string;
  email: string;
  role: UserRole;
  isAccountVerified: boolean;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}
