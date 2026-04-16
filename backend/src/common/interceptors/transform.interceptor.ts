import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        const hasDataField = data && typeof data === 'object' && 'data' in data;
        const hasMessageField = data && typeof data === 'object' && 'message' in data;

        const message = data?.message || 'Request successful';
        let resultData = hasDataField ? data.data : data;

        // If the original data only contained a message, we should probably return null for data
        // to avoid { message: "...", data: { message: "..." } }
        if (hasMessageField && !hasDataField && Object.keys(data).length === 1) {
          resultData = null;
        }

        return {
          statusCode,
          success: true,
          message,
          data: resultData,
        };
      }),
    );
  }
}
