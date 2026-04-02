import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly resend: Resend,
    private readonly configService: ConfigService,
  ) {}

  async sendWelcomeEmail(name: string, email: string, tempPassword: string) {
    const fromEmail = this.configService.get<string>('EMAIL_FROM');

    if (!fromEmail) {
      throw new Error('EMAIL_FROM is not configured');
    }

    await this.resend.emails.send({
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
  }
}
