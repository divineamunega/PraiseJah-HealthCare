import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable()
export class DevDelayInterceptor implements NestInterceptor {
  private readonly delayMs: number;
  private readonly enabled: boolean;

  constructor() {
    this.enabled = process.env.DEV_DELAY_ENABLED === 'true';
    this.delayMs = parseInt(process.env.DEV_DELAY_MS || '3000', 10);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!this.enabled) {
      return next.handle();
    }

    return next.handle().pipe(delay(this.delayMs));
  }
}