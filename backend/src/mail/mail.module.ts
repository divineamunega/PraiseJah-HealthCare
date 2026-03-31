import { Module, Res } from '@nestjs/common';
import { MailService } from './mail.service.js';
import { Resend } from 'resend';
@Module({
  providers: [MailService, {
    provide: Resend,
    useFactory: () => new Resend(process.env.RESEND_API_KEY)
  }],

  exports: [MailService]
})
export class MailModule { }
