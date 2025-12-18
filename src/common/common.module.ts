import { Module } from '@nestjs/common';
import { AppLogger } from './logger/app-logger.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

/**
 * CommonModule - Module for shared/common services across the application
 * Provides AppLogger and LoggingInterceptor that can be used in other modules
 */
@Module({
  providers: [AppLogger, LoggingInterceptor],
  exports: [AppLogger, LoggingInterceptor],
})
export class CommonModule {}
