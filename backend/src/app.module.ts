import { Module } from '@nestjs/common';
import { AppService } from './app.service.js';
import { AppController } from './app.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { LoggerModule } from './logger/logger.module.js';
import { UsersModule } from './users/users.module.js';
import { MailModule } from './mail/mail.module.js';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { configDotenv } from 'dotenv';
import { RouterModule } from '@nestjs/core';

configDotenv()

@Module({
  imports: [
    RouterModule.register([{
      path: 'users',
      module: UsersModule
    }]),
    PrismaModule,
    LoggerModule,
    UsersModule,
    MailModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT!),
      },
    }),
    ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
