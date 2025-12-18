import { Image } from '@/shared/schemas/image.schema';

/**
 * PackageListItemDto - Simplified package data for list endpoints
 * Contains only essential fields for package listings
 * Used in GET /packages endpoint
 */
export class PackageListItemDto {
  id: string;
  name: string;
  description: string;
  duration: number; // Duration in days
  groupSize: number; // Maximum group size
  price: number; // Package price
}

/**
 * PackageDetailDto - Full package details for single package endpoint
 * Contains all package information including image and timestamps
 * Used in GET /packages/:id endpoint
 */
export class PackageDetailDto {
  id: string;
  destinationId: string; // Reference to destination
  name: string;
  description: string;
  duration: number; // Duration in days
  included: string[]; // List of included services/items
  image?: Image; // Package image (optional)
  groupSize: number; // Maximum group size
  price: number; // Package price
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
