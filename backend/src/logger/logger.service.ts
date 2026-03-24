import { Injectable } from '@nestjs/common';
import winston from 'winston';

const logger = winston.createLogger();
@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' }),
      ],
    });
  }

  info(msg: string, meta?: any) {
    this.logger.info(msg, meta);
  }

  error(msg: string, meta?: any) {
    this.logger.error(msg, meta);
  }
}
