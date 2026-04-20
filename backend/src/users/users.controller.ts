import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UsersService } from './users.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ActiveStatusGuard } from '../auth/guards/active-status.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Audit } from '../audit/decorators/audit.decorator.js';
import { AuditTargetType } from '@prisma/client';
import type { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) { }

  @Post('create')
  @UseGuards(JwtAuthGuard, ActiveStatusGuard)
  @Audit({ action: 'USER_CREATED', targetType: AuditTargetType.USER })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() creator,
  ) {
    return this.userService.create(createUserDto, creator);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, ActiveStatusGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns current user data' })
  async me(@CurrentUser() user: User) {
    const fullUser = await this.userService.findById(user.id);
    const { passwordHash, ...result } = fullUser;
    return result;
  }
}
