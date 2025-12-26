import { ResponseService } from '@/shared/services/response/response.service';
import { HttpStatus } from '@nestjs/common';

/**
 * ResponseService Unit Tests
 * Tests all static methods for consistent API responses
 */
describe('ResponseService', () => {
  describe('successResponse', () => {
    it('should return success response with data and default message', () => {
      const data = { id: '123', name: 'Test' };

      const result = ResponseService.successResponse(data);

      expect(result).toEqual({
        success: true,
        message: 'Operation completed successfully',
        data,
      });
    });

    it('should return success response with custom message', () => {
      const data = { id: '123', name: 'Test' };
      const message = 'Custom success message';

      const result = ResponseService.successResponse(data, message);

      expect(result).toEqual({
        success: true,
        message,
        data,
      });
    });

    it('should handle null data', () => {
      const result = ResponseService.successResponse(null);

      expect(result).toEqual({
        success: true,
        message: 'Operation completed successfully',
        data: null,
      });
    });

    it('should handle array data', () => {
      const data = [{ id: '1' }, { id: '2' }];

      const result = ResponseService.successResponse(data);

      expect(result.data).toEqual(data);
    });
  });

  describe('paginatedResponse', () => {
    it('should return paginated response with correct structure', () => {
      const items = [{ id: '1' }, { id: '2' }];
      const meta = {
        page: 1,
        limit: 10,
        total: 20,
        totalPages: 2,
      };

      const result = ResponseService.paginatedResponse(items, meta);

      expect(result).toEqual({
        success: true,
        data: items,
        meta: {
          page: 1,
          limit: 10,
          total: 20,
          totalPages: 2,
        },
      });
    });

    it('should handle empty items array', () => {
      const items: any[] = [];
      const meta = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      const result = ResponseService.paginatedResponse(items, meta);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('should calculate totalPages correctly', () => {
      const items = [{ id: '1' }];
      const meta = {
        page: 1,
        limit: 10,
        total: 15,
        totalPages: 2,
      };

      const result = ResponseService.paginatedResponse(items, meta);

      expect(result.meta.totalPages).toBe(2);
    });
  });

  describe('errorResponse', () => {
    it('should return error response with default status code', () => {
      const message = 'An error occurred';

      const result = ResponseService.errorResponse(message);

      expect(result).toEqual({
        success: false,
        message,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    });

    it('should return error response with custom status code', () => {
      const message = 'Not found';
      const statusCode = HttpStatus.NOT_FOUND;

      const result = ResponseService.errorResponse(message, statusCode);

      expect(result).toEqual({
        success: false,
        message,
        statusCode,
      });
    });

    it('should handle different HTTP status codes', () => {
      const message = 'Unauthorized';
      const statusCode = HttpStatus.UNAUTHORIZED;

      const result = ResponseService.errorResponse(message, statusCode);

      expect(result.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should handle internal server error status code', () => {
      const message = 'Internal server error';
      const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

      const result = ResponseService.errorResponse(message, statusCode);

      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});

