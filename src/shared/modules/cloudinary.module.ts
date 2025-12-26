import { Global, Module } from '@nestjs/common';
import { CloudinaryService } from '@/shared/services/cloudinary.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
