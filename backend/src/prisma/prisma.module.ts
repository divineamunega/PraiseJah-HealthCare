import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { LoggerModule } from '../logger/logger.module.js';
@Module({
  imports: [LoggerModule],
  providers: [PrismaService],
})
export class PrismaModule {}
