import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoggerService } from '../logger/logger.service.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly logger: LoggerService) {
    super()
  }
  async onModuleInit() {
    await this.$connect();
    this.logger.info("Prisma Connected to the database.")
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.info("Prisma Disconnected from the database.")

  }
}
