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
import { DestinationsService } from './destinations.service';
import { CreateDestinationDto } from './dtos/create-destination.dto';
import { UpdateDestinationDto } from './dtos/update-destination.dto';
import { QueryDestinationDto } from './dtos/query-destination.dto';
import { ResponseService } from '@/shared/services/response/response.service';
import {
  ImageUpload,
  RequiredImage,
} from '@/common/decorators/image-upload.decorator';
import { AuthRolesGuard } from '@/common/guards/auth/auth.guard';
import { Roles } from '@/common/auth/decorators/roles.decorator';
import { UserRole } from '@/modules/users/enums/user-role.enum';
import { CurrentUser } from '@/common/decorators/current-user/current-user.decorator';
import { JWTPayloadType } from '@/common/auth/types/jwt-payload.type';

@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get()
  async findAll(@Query() queryDto: QueryDestinationDto) {
    const result = await this.destinationsService.findAll(queryDto);
    return ResponseService.paginatedResponse(result.items, result.meta);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const result = await this.destinationsService.findById(id);
    return ResponseService.successResponse(
      result,
      'Destination fetched successfully',
    );
  }

  @Post()
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @ImageUpload()
  async create(
    @Body() dto: CreateDestinationDto,
    @CurrentUser() user: JWTPayloadType,
    @RequiredImage() file: Express.Multer.File,
  ) {
    const result = await this.destinationsService.create(dto, user, file);
    return ResponseService.successResponse(
      result,
      'Destination created successfully',
    );
  }

  @Patch(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @ImageUpload()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDestinationDto,
    @CurrentUser() user: JWTPayloadType,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const result = await this.destinationsService.update(id, dto, user, file);
    return ResponseService.successResponse(
      result,
      'Destination updated successfully',
    );
  }

  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string, @CurrentUser() user: JWTPayloadType) {
    const result = await this.destinationsService.delete(id, user);
    return ResponseService.successResponse(result, result.message);
  }
}
