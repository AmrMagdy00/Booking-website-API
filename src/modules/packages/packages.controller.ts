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
  UseGuards,
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
import { AuthRolesGuard } from '@/common/guards/auth/auth.guard';
import { Roles } from '@/common/auth/decorators/roles.decorator';
import { UserRole } from '@/modules/users/enums/user-role.enum';
import { CurrentUser } from '@/common/decorators/current-user/current-user.decorator';
import { JWTPayloadType } from '@/common/auth/types/jwt-payload.type';

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
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @ImageUpload()
  async createPackage(
    @Body() dto: CreatePackageDto,
    @CurrentUser() user: JWTPayloadType,
    @RequiredImage() file: Express.Multer.File,
  ) {
    const packageDetail = await this.packagesService.create(dto, user, file);
    return ResponseService.successResponse(
      packageDetail,
      'Package created successfully',
    );
  }

  @Patch(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @ImageUpload()
  async updatePackage(
    @Param('id') id: string,
    @Body() dto: UpdatePackageDto,
    @CurrentUser() user: JWTPayloadType,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const packageDetail = await this.packagesService.update(
      id,
      dto,
      user,
      file,
    );
    return ResponseService.successResponse(
      packageDetail,
      'Package updated successfully',
    );
  }

  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  async deletePackage(
    @Param('id') id: string,
    @CurrentUser() user: JWTPayloadType,
  ) {
    const result = await this.packagesService.delete(id, user);
    return ResponseService.successResponse(result, result.message);
  }
}
