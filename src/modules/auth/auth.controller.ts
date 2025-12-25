import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto as RegisterDto } from '../users/dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { ResponseService } from '@/shared/services/response/response.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return ResponseService.successResponse(result, 'User registered successfully');
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return ResponseService.successResponse(result, 'Login successful');
  }
}
