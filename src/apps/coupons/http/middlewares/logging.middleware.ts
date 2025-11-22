import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);

    res.on('finish', () => {
      const ms = Date.now() - start;
      console.log(
        `[RESPONSE] ${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`
      );
    });

    next();
  }
}
