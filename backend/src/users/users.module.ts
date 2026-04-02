import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { WelcomeMailModule } from '../mail/welcome-mail.module.js';
import { LoggerModule } from '../logger/logger.module.js';
import { RouterModule } from '@nestjs/core';

@Module({
  providers: [UsersService],
  imports: [PrismaModule, WelcomeMailModule, LoggerModule],
  exports: [UsersService],
})
export class UsersModule {}
