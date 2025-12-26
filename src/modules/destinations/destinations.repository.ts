import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Destination } from './schema/destination.schema';

@Injectable()
export class DestinationsRepository {
  constructor(
    @InjectModel(Destination.name)
    private readonly destinationModel: Model<Destination>,
  ) {}

  async create(data: any): Promise<Destination> {
    return this.destinationModel.create(data) as any;
  }

  async findAll(
    query: any,
    page: number,
    limit: number,
  ): Promise<{ destinations: Destination[]; total: number }> {
    const skip = (page - 1) * limit;
    const [destinations, total] = await Promise.all([
      this.destinationModel
        .find({ ...query, deletedAt: null })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 } as any)
        .exec(),
      this.destinationModel
        .countDocuments({ ...query, deletedAt: null })
        .exec(),
    ]);

    return { destinations: destinations as any[], total };
  }

  async findById(id: string): Promise<Destination | null> {
    return this.destinationModel.findOne({ _id: id, deletedAt: null }).exec();
  }

  async updateById(id: string, data: any): Promise<Destination | null> {
    return this.destinationModel
      .findOneAndUpdate({ _id: id, deletedAt: null }, data, { new: true })
      .exec();
  }

  async deleteById(id: string): Promise<Destination | null> {
    return this.destinationModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date() },
        { new: true },
      )
      .exec();
  }
}
