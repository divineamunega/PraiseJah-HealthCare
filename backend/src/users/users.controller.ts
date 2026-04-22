import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Post,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UsersService } from './users.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ActiveStatusGuard } from '../auth/guards/active-status.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Audit } from '../audit/decorators/audit.decorator.js';
import { AuditTargetType, AuditAction, Role } from '@prisma/client';
import type { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) { }

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard, ActiveStatusGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Audit({ action: AuditAction.USER_CREATED, targetType: AuditTargetType.USER })
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

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, ActiveStatusGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'List all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, ActiveStatusGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User data' })
  async findOne(@CurrentUser() actor: User, @Param('id') id: string) {
    const user = await this.userService.findById(id);
    const { passwordHash, ...result } = user;
    return result;
  }

  @Post(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard, ActiveStatusGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Audit({ action: AuditAction.USER_STATUS_UPDATED, targetType: AuditTargetType.USER })
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  async updateStatus(
    @CurrentUser() actor: User,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.userService.updateStatus(id, status, actor);
  }

  @Post(':id/update')
  @UseGuards(JwtAuthGuard, RolesGuard, ActiveStatusGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Audit({ action: AuditAction.USER_UPDATED, targetType: AuditTargetType.USER })
  @ApiOperation({ summary: 'Update user details (Admin only)' })
  async update(
    @CurrentUser() actor: User,
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateUserDto>,
  ) {
    if (!updateDto || Object.keys(updateDto).length === 0) {
      throw new BadRequestException('No update data provided');
    }
    return this.userService.update(id, updateDto, actor);
  }

  @Post(':id/delete')
  @UseGuards(JwtAuthGuard, RolesGuard, ActiveStatusGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Audit({ action: AuditAction.USER_DELETED, targetType: AuditTargetType.USER })
  @ApiOperation({ summary: 'Soft delete user (Admin only)' })
  async remove(@CurrentUser() actor: User, @Param('id') id: string) {
    return this.userService.remove(id, actor);
  }
}
