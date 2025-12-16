import { Module } from '@nestjs/common';
import { DestinationsController } from './controllers/destinations/destinations.controller';
import { DestinationsService } from './services/destinations/destinations.service';

@Module({
  controllers: [DestinationsController],
  providers: [DestinationsService]
})
export class DestinationsModule {}
