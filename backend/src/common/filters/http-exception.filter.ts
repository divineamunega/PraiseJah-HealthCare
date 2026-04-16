import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { appendFileSync } from 'fs';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    
    if (exception instanceof HttpException) {
      const exceptionResponse: any = exception.getResponse();
      message = typeof exceptionResponse === 'object'
        ? exceptionResponse.message || exceptionResponse.error
        : exceptionResponse;
    } else if (exception instanceof Error) {
      message = exception.message;
      // Log non-http errors to a file we can read
      try {
        appendFileSync('debug.log', `[${new Date().toISOString()}] ${exception.stack}\n`);
      } catch (e) {
        // ignore
      }
    }

    response.status(status).json({
      statusCode: status,
      success: false,
      message: Array.isArray(message) ? message[0] : message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
