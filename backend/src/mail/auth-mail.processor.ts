import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from './mail.service.js';
import { PasswordResetEmailJob } from './auth-mail.service.js';
import { LoggerService } from '../logger/logger.service.js';

@Processor('auth-email')
export class AuthMailProcessor extends WorkerHost {
  constructor(
    private readonly mailService: MailService,
    private readonly loggerService: LoggerService,
  ) {
    super();
  }

  async process(job: Job<PasswordResetEmailJob, any, string>): Promise<any> {
    const { name, email, resetToken } = job.data;

    try {
      await this.mailService.sendPasswordResetEmail(name, email, resetToken);
      this.loggerService.info(
        `✅ Password reset email sent successfully to ${email}`,
      );
    } catch (error) {
      this.loggerService.error(
        `❌ Failed to send password reset email to ${email}`,
        error,
      );
      throw error;
    }
  }
}
