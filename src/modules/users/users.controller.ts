import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { QueryUserDto } from './dtos/query-user.dto';
import { ResponseService } from '@/shared/services/response/response.service';
import { AuthRolesGuard } from '@/common/guards/auth/auth.guard';
import { Roles } from '@/common/auth/decorators/roles.decorator';
import { UserRole } from './enums/user-role.enum';
import { CurrentUser } from '@/common/decorators/current-user/current-user.decorator';
import { JWTPayloadType } from '@/common/auth/types/jwt-payload.type';

@Controller('users')
@UseGuards(AuthRolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  
  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(
    @Query() query: QueryUserDto,
    @CurrentUser() user: JWTPayloadType,
  ) {
    const result = await this.usersService.findAll(query, user);
    return ResponseService.paginatedResponse(result.items, result.meta);
  }
  
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: JWTPayloadType,
  ) {
    const result = await this.usersService.findById(id, user);
    return ResponseService.successResponse(result, 'User fetched successfully');
  }
  
  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: JWTPayloadType,
  ) {
    const result = await this.usersService.create(dto, user);
    return ResponseService.successResponse(result, 'User created successfully');
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: JWTPayloadType,
  ) {
    const result = await this.usersService.update(id, dto, user);
    return ResponseService.successResponse(result, 'User updated successfully');
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: JWTPayloadType,
  ) {
    const result = await this.usersService.delete(id, user);
    return ResponseService.successResponse(result, result.message);
  }
}
