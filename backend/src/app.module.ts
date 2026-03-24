import { Module } from '@nestjs/common';
import { AppService } from './app.service.js';
import { AppController } from './app.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { LoggerModule } from './logger/logger.module.js';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
