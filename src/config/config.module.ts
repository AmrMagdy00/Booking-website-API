import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';
import appConfig from './app.config';
import cloudinaryConfig from './cloudinary.module';
import jwtConfig from './jwt.config';

/**
 * AppConfigModule - Global configuration module
 * Loads database, app, cloudinary, and JWT configuration files
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, appConfig, cloudinaryConfig, jwtConfig],
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
