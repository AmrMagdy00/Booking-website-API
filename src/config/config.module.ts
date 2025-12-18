import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';
import appConfig from './app.config';

/**
 * AppConfigModule - Global configuration module
 * Loads database and app configuration files
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, appConfig],
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
