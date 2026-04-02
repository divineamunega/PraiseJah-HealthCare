import { Module, Res } from '@nestjs/common';
import { MailService } from './mail.service.js';
import { Resend } from 'resend';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { LoggerService } from '../logger/logger.service.js';
import { LoggerModule } from '../logger/logger.module.js';

@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [
    MailService,
    {
      provide: Resend,
      useFactory: (
        configService: ConfigService,
        loggerService: LoggerService,
      ) => {
        const apiKey = configService.get<string>('RESEND_API_KEY');
        const resendClient = new Resend(apiKey);
        loggerService.info('Resend Client Initialized Successfully');
        return resendClient;
      },
      inject: [ConfigService, LoggerService],
    },
  ],
  exports: [MailService],
})
export class MailModule {}
