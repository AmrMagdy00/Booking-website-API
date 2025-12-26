import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from '@/shared/services/cloudinary.service';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn(),
      upload_stream: jest.fn(),
    },
  },
}));

/**
 * CloudinaryService Unit Tests
 * Tests all business logic scenarios including success cases and error handling
 */
describe('CloudinaryService', () => {
  let service: CloudinaryService;
  let configService: jest.Mocked<ConfigService>;

  const mockConfig = {
    cloud_name: 'test-cloud',
    api_key: 'test-api-key',
    api_secret: 'test-api-secret',
  };

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        const configMap: Record<string, string> = {
          'cloudinary.cloud_name': mockConfig.cloud_name,
          'cloudinary.api_key': mockConfig.api_key,
          'cloudinary.api_secret': mockConfig.api_secret,
        };
        return configMap[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should configure cloudinary with correct credentials', () => {
      expect(cloudinary.config).toHaveBeenCalledWith({
        cloud_name: mockConfig.cloud_name,
        api_key: mockConfig.api_key,
        api_secret: mockConfig.api_secret,
      });
    });
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const filePath = '/tmp/test-image.jpg';
      const folder = 'test-folder';
      const mockResult = {
        secure_url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
        public_id: 'test-folder/test',
      };

      (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.uploadImage(filePath, folder);

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(filePath, {
        folder,
      });
      expect(result).toEqual({
        url: mockResult.secure_url,
        publicId: mockResult.public_id,
      });
    });

    it('should throw InternalServerErrorException on upload failure', async () => {
      const filePath = '/tmp/test-image.jpg';
      const folder = 'test-folder';

      (cloudinary.uploader.upload as jest.Mock).mockRejectedValue(
        new Error('Upload failed'),
      );

      await expect(service.uploadImage(filePath, folder)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.uploadImage(filePath, folder)).rejects.toThrow(
        'Cloudinary upload failed',
      );
    });
  });

  describe('deleteImage', () => {
    it('should delete image successfully', async () => {
      const publicId = 'test-folder/test';

      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
        result: 'ok',
      });

      await service.deleteImage(publicId);

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(publicId);
    });

    it('should throw InternalServerErrorException on deletion failure', async () => {
      const publicId = 'test-folder/test';

      (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(
        new Error('Deletion failed'),
      );

      await expect(service.deleteImage(publicId)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.deleteImage(publicId)).rejects.toThrow(
        'Cloudinary deletion failed',
      );
    });
  });

  describe('uploadImageFromBuffer', () => {
    it('should upload image from buffer successfully', async () => {
      const buffer = Buffer.from('test-image-data');
      const folder = 'test-folder';
      const mockResult = {
        secure_url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
        public_id: 'test-folder/test',
      };

      const mockStream = {
        end: jest.fn(),
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          setTimeout(() => {
            callback(null, mockResult);
          }, 0);
          return mockStream;
        },
      );

      const result = await service.uploadImageFromBuffer(buffer, folder);

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        { folder },
        expect.any(Function),
      );
      expect(mockStream.end).toHaveBeenCalledWith(buffer);
      expect(result).toEqual({
        url: mockResult.secure_url,
        publicId: mockResult.public_id,
      });
    });

    it('should reject on upload error', async () => {
      const buffer = Buffer.from('test-image-data');
      const folder = 'test-folder';
      const mockError = new Error('Upload failed');

      const mockStream = {
        end: jest.fn(),
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          setTimeout(() => {
            callback(mockError, null);
          }, 0);
          return mockStream;
        },
      );

      await expect(
        service.uploadImageFromBuffer(buffer, folder),
      ).rejects.toThrow('Upload failed');
    });

    it('should reject when result is null', async () => {
      const buffer = Buffer.from('test-image-data');
      const folder = 'test-folder';

      const mockStream = {
        end: jest.fn(),
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          setTimeout(() => {
            callback(null, null);
          }, 0);
          return mockStream;
        },
      );

      await expect(
        service.uploadImageFromBuffer(buffer, folder),
      ).rejects.toThrow('Cloudinary upload failed');
    });

    it('should handle non-Error rejection', async () => {
      const buffer = Buffer.from('test-image-data');
      const folder = 'test-folder';

      const mockStream = {
        end: jest.fn(),
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          setTimeout(() => {
            callback('string error', null);
          }, 0);
          return mockStream;
        },
      );

      await expect(
        service.uploadImageFromBuffer(buffer, folder),
      ).rejects.toThrow('Cloudinary upload failed');
    });
  });
});

