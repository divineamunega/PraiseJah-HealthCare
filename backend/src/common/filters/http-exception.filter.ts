import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { LoggerService } from '../../logger/logger.service.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = request['correlationId'];

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';

    if (exception instanceof HttpException) {
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
