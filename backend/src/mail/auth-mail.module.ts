import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail.module.js';
import { AuthMailService } from './auth-mail.service.js';
import { AuthMailProcessor } from './auth-mail.processor.js';
import { LoggerModule } from '../logger/logger.module.js';

@Module({
  imports: [
    ConfigModule,
    MailModule,
    LoggerModule,
    BullModule.registerQueue({
      name: 'auth-email',
    }),
  ],
  providers: [AuthMailService, AuthMailProcessor],
  exports: [AuthMailService],
})
export class AuthMailModule {}
