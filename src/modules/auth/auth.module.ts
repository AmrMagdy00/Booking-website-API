import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthMapper } from './mappers/auth.mapper';
import { UsersModule } from '@/modules/users/users.module';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    CommonModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const jwtConfig = config.get('jwt');
        return {
          secret: jwtConfig?.secret,
          signOptions: { expiresIn: jwtConfig?.expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthMapper],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
