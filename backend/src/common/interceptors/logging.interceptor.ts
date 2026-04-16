import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../../logger/logger.service.js';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const correlationId = request['correlationId'];
    const now = Date.now();

    return next.handle().pipe(
      tap(() =>
        this.logger.log(
          `[${correlationId}] ${method} ${url} ${Date.now() - now}ms`,
          LoggingInterceptor.name,
        ),
      ),
    );
  }
}
