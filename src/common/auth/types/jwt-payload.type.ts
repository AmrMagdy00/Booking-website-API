import { UserRole } from '@/modules/users/enums/user-role.enum';

export interface JWTPayloadType {
  id: string;
  email: string;
  userName: string;
  role: UserRole;
}
