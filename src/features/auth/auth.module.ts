import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthService } from './services/auth/auth.service';
import { TokenService } from './services/token/token.service';
import { SessionService } from './services/session/session.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, TokenService, SessionService]
})
export class AuthModule {}
