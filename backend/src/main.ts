import './instrument.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { DevDelayInterceptor } from './common/interceptors/dev-delay.interceptor.js';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';
import { LoggerService } from './logger/logger.service.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  const frontendUrl = process.env.FRONTEND_URL;
  app.enableCors({
    origin: frontendUrl ? frontendUrl.split(',') : [],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  if (frontendUrl) {
    logger.log(`CORS enabled for: ${frontendUrl}`);
  } else {
    logger.warn(
      'No FRONTEND_URL found in environment variables. CORS may block requests.',
    );
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(cookieParser());
  app.useGlobalInterceptors(
    new DevDelayInterceptor(),
    new LoggingInterceptor(logger),
    new TransformInterceptor(),
  );
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  app.setGlobalPrefix('api/v1');

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('PraiseJah HealthCare API')
    .setDescription('The EMR system backend API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('refresh_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
