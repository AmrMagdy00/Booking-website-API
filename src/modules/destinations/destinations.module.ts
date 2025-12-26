import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DestinationsController } from './destinations.controller';
import { DestinationsService } from './destinations.service';
import { DestinationsRepository } from './destinations.repository';
import { DestinationsMapper } from './mappers/destinations.mapper';
import { Destination, DestinationSchema } from './schema/destination.schema';
import { CommonModule } from '@/common/common.module';
import { CloudinaryModule } from '@/shared/modules/cloudinary.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { PackagesModule } from '@/modules/packages/packages.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Destination.name, schema: DestinationSchema },
    ]),
    CommonModule,
    CloudinaryModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    forwardRef(() => PackagesModule),
  ],
  controllers: [DestinationsController],
  providers: [DestinationsService, DestinationsRepository, DestinationsMapper],
  exports: [DestinationsService],
})
export class DestinationsModule {}
