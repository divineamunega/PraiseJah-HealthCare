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
import type { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) { }

  @Post('create')
  @UseGuards(JwtAuthGuard, ActiveStatusGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto, @CurrentUser() creator) {
    return this.userService.create(createUserDto, creator);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, ActiveStatusGuard)
  async me(@CurrentUser() user: User) {
    const fullUser = await this.userService.findById(user.id);
    const { passwordHash, ...result } = fullUser;
    return result;
  }
}
