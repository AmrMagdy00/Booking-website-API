import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AppLogger } from '../logger/app-logger.service';

/**
 * LoggingInterceptor - Intercepts all HTTP requests to log request details
 * Logs method, URL, status code, duration, and user ID for both success and error cases
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    const { method, url } = request;
    const userId = request.user?.id;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const statusCode = response.statusCode;

        this.logger.info('HTTP Request Success', {
          method,
          url,
          statusCode,
          duration,
          userId,
        });
      }),
      catchError((error) => {
        const duration = Date.now() - start;
        const statusCode = error.status || 500;

        this.logger.error('HTTP Request Failed', {
          method,
          url,
          statusCode,
          duration,
          userId,
          error: error.message,
        });

        return throwError(() => error);
      }),
    );
  }
}
