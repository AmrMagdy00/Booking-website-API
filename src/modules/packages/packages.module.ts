import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { PackagesRepository } from './packages.repository';
import { PackagesMapper } from './mappers/packages.mapper';

import { Package, PackageSchema } from './schema/package.schema';

import { CommonModule } from '@/common/common.module';
import { DestinationsModule } from '@/modules/destinations/destinations.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Package.name, schema: PackageSchema }]),
    CommonModule,
    forwardRef(() => DestinationsModule),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [PackagesController],
  providers: [PackagesService, PackagesRepository, PackagesMapper],
  exports: [PackagesService],
})
export class PackagesModule {}
