import * as NestCommon from '@nestjs/common';
import { Response, Request } from 'express';
import { LoggerService } from '../../logger/logger.service.js';
import { SentryExceptionCaptured } from '@sentry/nestjs';

@NestCommon.Catch()
export class AllExceptionsFilter implements NestCommon.ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  @SentryExceptionCaptured()
  catch(exception: unknown, host: NestCommon.ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = request['correlationId'];

    const status =
      exception instanceof NestCommon.HttpException
        ? exception.getStatus()
        : NestCommon.HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';

    if (exception instanceof NestCommon.HttpException) {
      const exceptionResponse: any = exception.getResponse();
      message =
        typeof exceptionResponse === 'object'
          ? exceptionResponse.message || exceptionResponse.error
          : exceptionResponse;
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `[${correlationId}] ${message}`,
        exception.stack,
        AllExceptionsFilter.name,
      );
    }

    response.status(status).json({
      statusCode: status,
      success: false,
      message: Array.isArray(message) ? message.join(', ') : message,
      errors: Array.isArray(message) ? message : [],
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
