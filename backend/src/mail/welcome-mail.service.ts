// src/mail/welcome-mail.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface WelcomeEmailJob {
  name: string;
  email: string;
  tempPassword: string;
}

@Injectable()
export class WelcomeMailService {
  constructor(
    @InjectQueue('welcome-email') // Queue name
    private readonly welcomeQueue: Queue,
  ) {}

  async addWelcomeEmailJob(data: WelcomeEmailJob) {
    await this.welcomeQueue.add(
      'send-welcome', // Job name
      data,
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: 50,
      },
    );
  }
}
