import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const id = crypto.randomUUID();
    // Attach to request object for use in interceptors/services
    req['correlationId'] = id;
    // Also attach to response headers so the client can reference it
    res.setHeader('x-correlation-id', id);
    next();
  }
}
