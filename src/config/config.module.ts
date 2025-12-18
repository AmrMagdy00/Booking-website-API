import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';
import cloudinaryConfig from './cloudinary.module';
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig,cloudinaryConfig],
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
