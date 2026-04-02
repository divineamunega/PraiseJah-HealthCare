import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoggerService } from '../logger/logger.service.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { configDotenv } from 'dotenv';
configDotenv();

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly logger: LoggerService) {
    super({ adapter });
  }
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.info('Prisma Client Initilized.');
    } catch (err) {
      this.logger.error(
        'An error occured while connecting to the database.',
        err,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.info('Prisma Disconnected from the database.');
  }
}
