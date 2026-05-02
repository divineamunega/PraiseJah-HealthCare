import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../logger/logger.service.js';

@Injectable()
export class MailService {
  private readonly brandColor = '#2563eb'; // Clinical Blue
  private readonly backgroundColor = '#f8fafc';
  private readonly cardColor = '#ffffff';
  private readonly textColor = '#1e293b';
  private readonly mutedColor = '#64748b';

  constructor(
    private readonly resend: Resend,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  private getEmailLayout(title: string, contentHtml: string): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || '#';
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              background-color: ${this.backgroundColor}; 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: ${this.textColor};
              -webkit-font-smoothing: antialiased;
            }
            .wrapper { width: 100%; table-layout: fixed; background-color: ${this.backgroundColor}; padding-bottom: 40px; }
            .container { max-width: 600px; margin: 0 auto; background-color: ${this.cardColor}; border-top: 4px solid ${this.brandColor}; margin-top: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .header { padding: 32px 40px; text-align: center; }
            .logo { font-size: 24px; font-weight: 700; color: ${this.brandColor}; letter-spacing: -0.02em; text-transform: uppercase; text-decoration: none; }
            .content { padding: 0 40px 40px 40px; line-height: 1.6; }
            .footer { padding: 32px 40px; text-align: center; color: ${this.mutedColor}; font-size: 14px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: ${this.brandColor}; 
              color: #ffffff !important; 
              text-decoration: none; 
              border-radius: 4px; 
              font-weight: 600; 
              margin-top: 24px;
            }
            .mono-code { 
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; 
              background-color: #f1f5f9; 
              padding: 12px; 
              border-radius: 4px; 
              font-size: 18px; 
              letter-spacing: 2px; 
              text-align: center; 
              margin: 20px 0;
              color: ${this.brandColor};
              font-weight: 700;
            }
            h1 { font-size: 24px; font-weight: 600; color: ${this.textColor}; margin-bottom: 16px; letter-spacing: -0.01em; }
            p { margin-bottom: 16px; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <a href="${frontendUrl}" class="logo">PraiseJah HealthCare</a>
              </div>
              <div class="content">
                ${contentHtml}
              </div>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} PraiseJah HealthCare. All rights reserved.<br>
              Professional EMR Solutions
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async sendWelcomeEmail(name: string, email: string, tempPassword: string) {
    const fromEmail = this.configService.get<string>('EMAIL_FROM');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    if (!fromEmail || !frontendUrl) {
      throw new Error('EMAIL_FROM or FRONTEND_URL is not configured');
    }

    const contentHtml = `
      <h1>Welcome to the Team, ${name.split(' ')[0]}!</h1>
      <p>Your professional account at PraiseJah HealthCare has been successfully created.</p>
      <p>To get started, please log in with the temporary password provided below. You will be prompted to change it upon your first access.</p>
      <div class="mono-code">${tempPassword}</div>
      <div style="text-align: center;">
        <a href="${frontendUrl}/login" class="button">Login to Platform</a>
      </div>
      <p style="margin-top: 24px;">If you have any questions regarding your access or the platform, please contact your department administrator.</p>
    `;

    const { error } = await this.resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Welcome to PraiseJah HealthCare - Account Created',
      html: this.getEmailLayout('Welcome', contentHtml),
    });

    if (error) {
      this.logger.error('Failed to send welcome email', error);
      throw new Error('Failed to send welcome email');
    }
  }

  async sendPasswordResetEmail(
    name: string,
    email: string,
    resetToken: string,
  ) {
    const fromEmail = this.configService.get<string>('EMAIL_FROM');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    if (!fromEmail || !frontendUrl) {
      throw new Error('EMAIL_FROM or FRONTEND_URL is not configured');
    }

    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const contentHtml = `
      <h1>Password Reset Request</h1>
      <p>Hi ${name},</p>
      <p>We received a request to reset the password for your PraiseJah HealthCare account. Click the button below to choose a new password:</p>
      <div style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      <p style="margin-top: 32px; font-size: 14px; color: ${this.mutedColor};">
        This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.
      </p>
      <p style="font-size: 12px; color: ${this.mutedColor}; word-break: break-all;">
        Or copy and paste this link: <br>
        ${resetLink}
      </p>
    `;

    const { error } = await this.resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Reset Your Password - PraiseJah HealthCare',
      html: this.getEmailLayout('Password Reset', contentHtml),
    });

    if (error) {
      this.logger.error('Failed to send password reset email', error);
      throw new Error('Failed to send password reset email');
    }
  }
}
