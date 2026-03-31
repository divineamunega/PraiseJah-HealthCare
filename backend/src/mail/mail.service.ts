import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Resend } from "resend";


@Injectable()
export class MailService {
  constructor(private readonly resend: Resend) { }


  async sendWelcomeEmail(email: string, tempPassword: string) {
    await this.resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [email],
      subject: "hello world",
      html: "<strong>it works!</strong>",
    })
  }
}
