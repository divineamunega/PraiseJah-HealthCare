import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface PasswordResetEmailJob {
  name: string;
  email: string;
  resetToken: string;
}

@Injectable()
export class AuthMailService {
  constructor(
    @InjectQueue('auth-email')
    private readonly authEmailQueue: Queue,
  ) {}

  async addPasswordResetEmailJob(data: PasswordResetEmailJob) {
    await this.authEmailQueue.add('send-password-reset', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: 50,
    });
  }
}
