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

  async sendPasswordResetEmail(name: string, email: string, resetToken: string) {
    const fromEmail = this.configService.get<string>('EMAIL_FROM');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    if (!fromEmail || !frontendUrl) {
      throw new Error('EMAIL_FROM or FRONTEND_URL is not configured');
    }

    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const { error } = await this.resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Password Reset Request - PraiseJah',
      html: `<p>Hi ${name},</p>
             <p>You requested a password reset. Click the link below to reset your password:</p>
             <p><a href="${resetLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
             <p>Or copy and paste this link into your browser:</p>
             <p>${resetLink}</p>
             <p>This link will expire in 1 hour.</p>
             <p>If you didn't request this, please ignore this email.</p>`,
    });

    if (error) {
      this.logger.error('Failed to send password reset email', error);
      throw new Error('Failed to send password reset email');
    }
  }
}
