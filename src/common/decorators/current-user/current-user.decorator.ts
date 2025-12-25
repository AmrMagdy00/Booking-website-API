import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JWTPayloadType } from '@/common/auth/types/jwt-payload.type';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const payload: JWTPayloadType = req['user'];
    return payload;
  },
);
