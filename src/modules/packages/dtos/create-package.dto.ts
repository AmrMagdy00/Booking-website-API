import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  MinLength,
  MaxLength,
  IsMongoId,
  ArrayMinSize,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * CreatePackageDto - Data Transfer Object for creating a new package
 * Validates input data before creating a package
 */
export class CreatePackageDto {
  // Destination ID - must be valid MongoDB ObjectId
  @IsNotEmpty()
  @IsMongoId()
  destinationId: string;

  // Package name - required, 2-100 characters
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  // Package description - required string
  @IsNotEmpty()
  @IsString()
  description: string;

  // Duration in days - required, minimum 1 day
  @IsNotEmpty()
  @Type(() => Number) // Convert string to number for multipart/form-data
  @IsNumber()
  @Min(1)
  duration: number;

  // Included services/items - optional array
  // Supports JSON string or comma-separated values
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map((item: string) => item.trim());
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(0)
  included?: string[];

  // Maximum group size - required, minimum 1 person
  @IsNotEmpty()
  @Type(() => Number) // Convert string to number for multipart/form-data
  @IsNumber()
  @Min(1)
  groupSize: number;

  // Package price - required, minimum 0
  @IsNotEmpty()
  @Type(() => Number) // Convert string to number for multipart/form-data
  @IsNumber()
  @Min(0)
  price: number;
}
