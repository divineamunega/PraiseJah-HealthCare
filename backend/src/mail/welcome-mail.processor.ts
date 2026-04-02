// TODO UNIT TEST

import { Processor } from '@nestjs/bullmq';
import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from './mail.service.js';
import { WelcomeEmailJob } from './welcome-mail.service.js';
import { LoggerService } from '../logger/logger.service.js';

@Processor('welcome-email') // Queue name
export class WelcomeMailProcessor extends WorkerHost {
  constructor(
    private readonly mailService: MailService,
    private readonly loggerService: LoggerService,
  ) {
    super();
  }

  async process(job: Job<WelcomeEmailJob, any, string>): Promise<any> {
    const { name, email, tempPassword } = job.data;

    try {
      await this.mailService.sendWelcomeEmail(name, email, tempPassword);

      this.loggerService.info(`✅ Welcome email sent successfully to ${email}`);
    } catch (error) {
      this.loggerService.error(
        `❌ Failed to send welcome email to ${email}`,
        error,
      );
      throw error; // BullMQ will handle retries
    }
  }
}
