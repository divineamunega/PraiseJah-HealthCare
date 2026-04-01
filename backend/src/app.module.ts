import { Module } from '@nestjs/common';
import { AppService } from './app.service.js';
import { AppController } from './app.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { LoggerModule } from './logger/logger.module.js';
import { UsersModule } from './users/users.module.js';
import { MailModule } from './mail/mail.module.js';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [PrismaModule, LoggerModule, UsersModule, MailModule, BullModule.forRoot({
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT!)
    }
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
