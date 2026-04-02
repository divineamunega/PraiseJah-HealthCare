import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../logger/logger.service.js';

@Injectable()
export class MailService {
  constructor(
    private readonly resend: Resend,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) { }

  async sendWelcomeEmail(name: string, email: string, tempPassword: string) {
    const fromEmail = this.configService.get<string>('EMAIL_FROM');
    if (!fromEmail) {
      throw new Error('EMAIL_FROM is not configured');
    }

    const { error, data } = await this.resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Welcome To PraiseJah',
      template: {
        id: 'account-creation',
        variables: {
          TEMPPASSWORD: tempPassword,
          NAME: name,
        },
      },
    });

    if (error) {
      this.logger.error('Failed to send welcome email', error);
      throw new Error('Failed to send welcome email');
    }

  }
}
