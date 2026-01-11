import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Correlation ID Middleware
 * 
 * Adds correlation ID to every request for tracing
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Get correlation ID from header or generate new one
        const correlationId =
            (req.headers['x-correlation-id'] as string) || randomUUID();

        // Attach to request object
        (req as any).correlationId = correlationId;

        // Add to response headers
        res.setHeader('x-correlation-id', correlationId);

        next();
    }
}
