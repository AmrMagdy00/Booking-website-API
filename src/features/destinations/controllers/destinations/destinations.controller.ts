import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { DestinationsService } from '../../services/destinations/destinations.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateDestinationDto } from '../../dtos/create-destination.dto/create-destination.dto';
import { UpdateDestinationDto } from '../../dtos/create-destination.dto/update-destination.dto';

@Controller('')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get()
  getAll() {
    return this.destinationsService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.destinationsService.getById(id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  create(
    @Body() dto: CreateDestinationDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.destinationsService.Create(dto, files);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDestinationDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.destinationsService.update(id, dto, files);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.destinationsService.delete(id);
  }
}
