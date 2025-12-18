import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Destination, DestinationDocument } from '../../schemas/destination.schema/destination.schema';
import { Model } from 'mongoose';
import { CloudinaryService } from '@/shared/services/cloudinary.service';
import { CreateDestinationDto } from '../../dtos/create-destination.dto/create-destination.dto';
import { unlink, unlinkSync } from 'fs';
import { UpdateDestinationDto } from '../../dtos/create-destination.dto/update-destination.dto';

@Injectable()
export class DestinationsService {
   constructor( @InjectModel(Destination.name)
                private readonly destinationModel:Model<DestinationDocument>,
                private readonly cloudinaryService:CloudinaryService
            ){}


    async getAll(){
        const destinations = await this.destinationModel.find()
        return destinations;
    }

    async getById(id:string){
        const destination = await this.destinationModel.findById(id)
        if(!destination) throw new NotFoundException("destination not supported yet")
        return destination;
    }

    async Create(dto:CreateDestinationDto,files:Express.Multer.File[]){
        try{
            const uploadImage = await Promise.all(files.map(async(f)=>{
               const upload = await this.cloudinaryService.uploadImage(f.path,'destination')
                unlinkSync(f.path)
                return upload
            }))

            const destination = await this.destinationModel.create({...dto,images:uploadImage})
            return destination
        }catch(error){
            throw new BadRequestException(error)
        }

    }

    async update(id: string, dto: UpdateDestinationDto, files?: Express.Multer.File[]) {
    try {
      const destination = await this.destinationModel.findById(id);
      if (!destination) throw new NotFoundException('Destination not Found');

      let images = destination.images;

      if (files && files.length > 0) {
        const newImages = await Promise.all(
          files.map(async (file) => {
            const uploaded = await this.cloudinaryService.uploadImage(file.path, 'destinations');
            unlinkSync(file.path);
            return uploaded;
          })
        );
        images = [...images, ...newImages];
      }

      const updatedDestination = await this.destinationModel.findByIdAndUpdate(
        id,
        { ...dto, images },
        { new: true }
      );
      return updatedDestination;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update destination',error);
    }
  }

     async delete(id: string) {
    try {
      const destination = await this.destinationModel.findById(id);
      if (!destination) throw new NotFoundException('Destination not found');

      await Promise.all(destination.images.map((img) => this.cloudinaryService.deleteImage(img.publicId)));

      await this.destinationModel.findByIdAndDelete(id);

      return { message: 'Destination deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete destination',error);
    }
  }
}

