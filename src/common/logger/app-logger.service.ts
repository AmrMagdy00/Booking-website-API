import { Injectable, Logger } from '@nestjs/common';

/**
 * AppLogger - Custom logger service for structured logging
 * Provides methods for different log levels (info, warn, error, debug)
 * Formats messages with optional metadata as JSON
 */
@Injectable()
export class AppLogger {
  private readonly logger = new Logger('App');

  info(message: string, meta?: any) {
    this.logger.log(this.format(message, meta));
  }

  warn(message: string, meta?: any) {
    this.logger.warn(this.format(message, meta));
  }

  error(message: string, meta?: any) {
    this.logger.error(this.format(message, meta));
  }

  debug(message: string, meta?: any) {
    this.logger.debug(this.format(message, meta));
  }

  private format(message: string, meta?: any): string {
    if (!meta) return message;
    return `${message} | ${JSON.stringify(meta)}`;
  }
}
