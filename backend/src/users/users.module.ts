import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  providers: [UsersService],
  imports: [PrismaModule],
  exports: [UsersService],
})
export class UsersModule {}
