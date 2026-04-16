import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import winston from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, trace }) => {
              return `${timestamp} [${context || 'Application'}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
            }),
          ),
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    });
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  fatal(message: any, trace?: any, context?: string) {
    this.logger.error(message, { 
      trace: trace instanceof Error ? trace.stack : JSON.stringify(trace), 
      context, 
      fatal: true 
    });
  }

  error(message: any, trace?: any, context?: string) {
    this.logger.error(message, { 
      trace: trace instanceof Error ? trace.stack : JSON.stringify(trace), 
      context 
    });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }

  // Keep compatibility with existing calls if any
  info(message: any, context?: string) {
    this.log(message, context);
  }
}
