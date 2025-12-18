import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UploadedFile,
} from '@nestjs/common';

import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dtos/create-package.dto';
import { QueryPackageDto } from './dtos/query-package.dto';
import { ResponseService } from '@/shared/services/response/response.service';
import {
  ImageUpload,
  RequiredImage,
} from '@/common/decorators/image-upload.decorator';
import { UpdatePackageDto } from './dtos/update-package.dto';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  async getPackages(@Query() queryDto: QueryPackageDto) {
    const result = await this.packagesService.findByDestinationId(queryDto);
    return ResponseService.paginatedResponse(result.items, result.meta);
  }

  @Get(':id')
  async getPackageById(@Param('id') id: string) {
    const packageDetail = await this.packagesService.findById(id);
    return ResponseService.successResponse(
      packageDetail,
      'Package retrieved successfully',
    );
  }

  @Post()
  @ImageUpload()
  async createPackage(
    @Body() dto: CreatePackageDto,
    @RequiredImage() file: Express.Multer.File,
  ) {
    const packageDetail = await this.packagesService.create(dto, file);
    return ResponseService.successResponse(
      packageDetail,
      'Package created successfully',
    );
  }

  @Patch(':id')
  @ImageUpload()
  async updatePackage(
    @Param('id') id: string,
    @Body() dto: UpdatePackageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const packageDetail = await this.packagesService.update(id, dto, file);
    return ResponseService.successResponse(
      packageDetail,
      'Package updated successfully',
    );
  }

  @Delete(':id')
  async deletePackage(@Param('id') id: string) {
    const result = await this.packagesService.delete(id);
    return ResponseService.successResponse(result, result.message);
  }
}
