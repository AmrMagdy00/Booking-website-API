import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JWTPayloadType } from '@/common/auth/types/jwt-payload.type';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: JWTPayloadType }>();
    const payload: JWTPayloadType | undefined = req.user;
    return payload;
  },
);
