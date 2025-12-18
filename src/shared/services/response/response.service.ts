import { HttpStatus } from '@nestjs/common';

/**
 * ResponseService - Unified response service for consistent API responses
 * Provides standardized response formats for success, pagination, and errors
 */
export class ResponseService {
  static successResponse<T>(data: T, message?: string) {
    return {
      success: true,
      message: message || 'Operation completed successfully',
      data,
    };
  }

  static paginatedResponse<T>(
    items: T[],
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
  ) {
    return {
      success: true,
      data: items,
      meta: {
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPages: meta.totalPages,
      },
    };
  }

  static errorResponse(
    message: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    return {
      success: false,
      message,
      statusCode,
    };
  }
}
