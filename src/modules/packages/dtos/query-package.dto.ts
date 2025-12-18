import { IsNotEmpty, IsMongoId, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * QueryPackageDto - Data Transfer Object for querying packages
 * Used for filtering and pagination in GET /packages endpoint
 */
export class QueryPackageDto {
  // Destination ID - required, must be valid MongoDB ObjectId
  @IsNotEmpty()
  @IsMongoId()
  destinationId: string;

  // Page number - optional, defaults to 1, minimum 1
  @IsOptional()
  @Type(() => Number) // Convert string to number from query params
  @IsInt()
  @Min(1)
  page?: number = 1;

  // Items per page - optional, defaults to 10, minimum 1
  @IsOptional()
  @Type(() => Number) // Convert string to number from query params
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
