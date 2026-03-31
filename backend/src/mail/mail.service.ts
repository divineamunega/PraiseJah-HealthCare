import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Resend } from "resend";


@Injectable()
export class MailService {
  constructor(private readonly resend: Resend) { }


  async sendWelcomeEmail(name: string, email: string, tempPassword: string) {
    await this.resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [email],
      subject: "Welcome To PraiseJah",
      template: {
        id: 'order-confirmation',
        variables: {
          TEMPPASSWORD: tempPassword,
          NAME: name,
        },
      }
    })
  }


}
