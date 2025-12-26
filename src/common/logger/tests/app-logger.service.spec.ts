import { Test, TestingModule } from '@nestjs/testing';
import { AppLogger } from '@/common/logger/app-logger.service';
import { Logger } from '@nestjs/common';

jest.mock('@nestjs/common', () => {
  const actual = jest.requireActual('@nestjs/common');
  return {
    ...actual,
    Logger: jest.fn().mockImplementation(() => ({
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    })),
  };
});

/**
 * AppLogger Unit Tests
 * Tests all logging methods and formatting
 */
describe('AppLogger', () => {
  let service: AppLogger;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    } as any;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppLogger],
    }).compile();

    service = module.get<AppLogger>(AppLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('info', () => {
    it('should log info message without meta', () => {
      const message = 'Test info message';

      service.info(message);

      expect(mockLogger.log).toHaveBeenCalledWith(message);
    });

    it('should log info message with meta', () => {
      const message = 'Test info message';
      const meta = { userId: '123', action: 'create' };

      service.info(message, meta);

      expect(mockLogger.log).toHaveBeenCalledWith(
        `${message} | ${JSON.stringify(meta)}`,
      );
    });

    it('should format meta as JSON string', () => {
      const message = 'Test message';
      const meta = { key: 'value', number: 123 };

      service.info(message, meta);

      expect(mockLogger.log).toHaveBeenCalledWith(
        `${message} | ${JSON.stringify(meta)}`,
      );
    });
  });

  describe('warn', () => {
    it('should log warn message without meta', () => {
      const message = 'Test warn message';

      service.warn(message);

      expect(mockLogger.warn).toHaveBeenCalledWith(message);
    });

    it('should log warn message with meta', () => {
      const message = 'Test warn message';
      const meta = { warning: 'low balance' };

      service.warn(message, meta);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        `${message} | ${JSON.stringify(meta)}`,
      );
    });
  });

  describe('error', () => {
    it('should log error message without meta', () => {
      const message = 'Test error message';

      service.error(message);

      expect(mockLogger.error).toHaveBeenCalledWith(message);
    });

    it('should log error message with meta', () => {
      const message = 'Test error message';
      const meta = { error: 'Database connection failed', code: 500 };

      service.error(message, meta);

      expect(mockLogger.error).toHaveBeenCalledWith(
        `${message} | ${JSON.stringify(meta)}`,
      );
    });

    it('should handle error objects in meta', () => {
      const message = 'Test error message';
      const error = new Error('Test error');
      const meta = { error, stack: error.stack };

      service.error(message, meta);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(message),
      );
    });
  });

  describe('debug', () => {
    it('should log debug message without meta', () => {
      const message = 'Test debug message';

      service.debug(message);

      expect(mockLogger.debug).toHaveBeenCalledWith(message);
    });

    it('should log debug message with meta', () => {
      const message = 'Test debug message';
      const meta = { debug: 'variable value', step: 1 };

      service.debug(message, meta);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        `${message} | ${JSON.stringify(meta)}`,
      );
    });
  });

  describe('format', () => {
    it('should return message only when meta is undefined', () => {
      const message = 'Test message';

      service.info(message);

      expect(mockLogger.log).toHaveBeenCalledWith(message);
    });

    it('should return message only when meta is null', () => {
      const message = 'Test message';

      service.info(message, null as any);

      expect(mockLogger.log).toHaveBeenCalledWith(message);
    });

    it('should format complex meta objects', () => {
      const message = 'Test message';
      const meta = {
        user: { id: '123', name: 'John' },
        actions: ['create', 'update'],
        timestamp: new Date('2023-01-01'),
      };

      service.info(message, meta);

      expect(mockLogger.log).toHaveBeenCalledWith(
        `${message} | ${JSON.stringify(meta)}`,
      );
    });

    it('should handle empty meta object', () => {
      const message = 'Test message';
      const meta = {};

      service.info(message, meta);

      expect(mockLogger.log).toHaveBeenCalledWith(
        `${message} | ${JSON.stringify(meta)}`,
      );
    });
  });
});

