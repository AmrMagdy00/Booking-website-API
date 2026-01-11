import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '@/modules/users/enums/user-role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    trim: true,
    maxlength: 150,
  })
  userName: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    maxlength: 150,
    lowercase: true,
  })
  email: string;

  @Prop({
    required: true,
    select: false,
  })
  password: string;

  @Prop({ default: false })
  isAccountVerified: boolean;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.NORMAL_USER,
  })
  role: UserRole;

  @Prop({ required: false, trim: true })
  phone?: string;

  @Prop({ default: null })
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
