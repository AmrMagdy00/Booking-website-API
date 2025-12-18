import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { PackagesRepository } from './packages.repository';
import { PackagesMapper } from './mappers/packages.mapper';

import { Package, PackageSchema } from './schema/package.schema';

import { CommonModule } from '@/common/common.module';
import { DestinationsModule } from '@/modules/destinations/destinations.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Package.name, schema: PackageSchema }]),
    CommonModule,
    DestinationsModule, // Import DestinationsModule to use DestinationsService
  ],
  controllers: [PackagesController],
  providers: [PackagesService, PackagesRepository, PackagesMapper],
  exports: [PackagesService],
})
export class PackagesModule {}
