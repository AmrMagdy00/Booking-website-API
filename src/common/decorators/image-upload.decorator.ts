import {
  applyDecorators,
  BadRequestException,
  UseInterceptors,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Request } from 'express';

export function ImageUpload() {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor('image', {
        storage: memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
          if (!file.mimetype.startsWith('image/')) {
            return cb(
              new BadRequestException('Only image files are allowed'),
              false,
            );
          }
          cb(null, true);
        },
      }),
    ),
  );
}

export const RequiredImage = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx
      .switchToHttp()
      .getRequest<Request & { file?: Express.Multer.File }>();
    if (!req.file) {
      throw new BadRequestException('Image is required');
    }
    return req.file;
  },
);
