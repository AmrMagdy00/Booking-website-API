import { Module } from '@nestjs/common';
import { DestinationsController } from './controllers/destinations/destinations.controller';
import { DestinationsService } from './services/destinations/destinations.service';
import { Destination,DestinationSchema } from './schemas/destination.schema/destination.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { existsSync, mkdirSync } from 'fs';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

const uploadPath = '.uploads';
if(!existsSync(uploadPath)) mkdirSync(uploadPath)

@Module({
  controllers: [DestinationsController],
  providers: [DestinationsService],
  imports:[MongooseModule.forFeature([{name:Destination.name,schema:DestinationSchema}]),
  MulterModule.register({
    storage:diskStorage({
      destination:uploadPath,
      filename:(req,file,cb)=> cb(null,Date.now()+'-'+file.originalname)
    })
  }),
]
})
export class DestinationsModule {}
