import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Package, PackageDocument } from './schema/package.schema';

/**
 * PackagesRepository - Repository layer for database operations
 * Handles all direct database interactions for packages
 * Separates data access logic from business logic
 */
@Injectable()
export class PackagesRepository {
  constructor(
    @InjectModel(Package.name)
    private readonly packageModel: Model<PackageDocument>,
  ) {}

  /**
   * Creates a new package in the database
   * @param packageData - Package data to create
   * @returns Created package document
   */
  async create(packageData: Partial<Package>): Promise<PackageDocument> {
    return await this.packageModel.create(packageData);
  }

  /**
   * Finds packages by destination ID with pagination
   * @param destinationId - Destination ObjectId to filter by
   * @param page - Page number (1-indexed)
   * @param limit - Number of items per page
   * @returns Object containing packages array and total count
   */
  async findByDestinationId(
    destinationId: string,
    page: number,
    limit: number,
  ): Promise<{ packages: PackageDocument[]; total: number }> {
    const skip = (page - 1) * limit;

    const [packages, total] = await Promise.all([
      this.packageModel
        .find({ destinationId: new Types.ObjectId(destinationId) })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.packageModel
        .countDocuments({ destinationId: new Types.ObjectId(destinationId) })
        .exec(),
    ]);

    return { packages, total };
  }

  /**
   * Finds a package by its ID
   * @param id - Package ObjectId
   * @returns Package document or null if not found
   */
  async findById(id: string): Promise<PackageDocument | null> {
    return await this.packageModel.findById(id).exec();
  }

  /**
   * Updates a package by its ID
   * @param id - Package ObjectId
   * @param updateData - Partial package data to update
   * @returns Updated package document or null if not found
   */
  async updateById(
    id: string,
    updateData: Partial<Package>,
  ): Promise<PackageDocument | null> {
    return await this.packageModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  /**
   * Deletes a package by its ID
   * @param id - Package ObjectId
   * @returns Deleted package document or null if not found
   */
  async deleteById(id: string): Promise<PackageDocument | null> {
    return await this.packageModel.findByIdAndDelete(id).exec();
  }
}
