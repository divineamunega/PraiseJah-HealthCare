import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

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
        ),
      ),
    );
  }
}
