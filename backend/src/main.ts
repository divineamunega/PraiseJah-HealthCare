import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';
import { LoggerService } from './logger/logger.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  
  const logger = app.get(LoggerService);
  app.useLogger(logger);

  app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));
  app.use(cookieParser());
  app.useGlobalInterceptors(new LoggingInterceptor(logger), new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
