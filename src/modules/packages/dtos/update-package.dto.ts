import { PartialType } from '@nestjs/mapped-types';
import { CreatePackageDto } from './create-package.dto';

/**
 * UpdatePackageDto - Data Transfer Object for updating a package
 * Extends CreatePackageDto with all fields optional (using PartialType)
 * Allows partial updates to package properties
 */
export class UpdatePackageDto extends PartialType(CreatePackageDto) {}
