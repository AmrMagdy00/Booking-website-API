import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(data);
  }

  async findAll(
    query: any,
    page: number,
    limit: number,
  ): Promise<{ users: UserDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel
        .find({ ...query, deletedAt: null })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.userModel
        .countDocuments({ ...query, deletedAt: null })
        .exec(),
    ]);

    return { users, total };
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ _id: id, deletedAt: null })
      .exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase(), deletedAt: null })
      .exec();
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase(), deletedAt: null })
      .select('+password')
      .exec();
  }

  async updateById(id: string, data: Partial<User>): Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate({ _id: id, deletedAt: null }, data, { new: true })
      .exec();
  }

  async deleteById(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date() },
        { new: true },
      )
      .exec();
  }
}
