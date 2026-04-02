import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail.module.js'; // ← Import your original MailModule
import { WelcomeMailService } from './welcome-mail.service.js';
import { WelcomeMailProcessor } from './welcome-mail.processor.js';
import { LoggerModule } from '../logger/logger.module.js'; // if you're using logger

@Module({
  imports: [
    ConfigModule,
    MailModule, // ← This brings MailService + Resend provider
    LoggerModule, // ← For LoggerService in processor
    BullModule.registerQueue({
      name: 'welcome-email',
    }),
  ],
  providers: [WelcomeMailService, WelcomeMailProcessor],
  exports: [WelcomeMailService], // Only need to export the queue service
})
export class WelcomeMailModule {}
