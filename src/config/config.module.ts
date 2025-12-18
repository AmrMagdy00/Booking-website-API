import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';
import appConfig from './app.config';
import cloudinaryConfig from './cloudinary.module';

/**
 * AppConfigModule - Global configuration module
 * Loads database, app, and cloudinary configuration files
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, appConfig, cloudinaryConfig],
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
