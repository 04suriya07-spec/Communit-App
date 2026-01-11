import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../services/metrics.service';

/**
 * Metrics Middleware
 * 
 * Records HTTP request metrics (count, duration, errors)
 */
@Injectable()
export class MetricsMiddleware implements NestMiddleware {
    constructor(private readonly metricsService: MetricsService) { }

    use(req: Request, res: Response, next: NextFunction) {
        const start = Date.now();

        // Capture response finish event
        res.on('finish', () => {
            const duration = Date.now() - start;
            const method = req.method;
            const endpoint = this.normalizeEndpoint(req.path);
            const status = res.statusCode;

            // Record metrics
            this.metricsService.incrementRequests(method, endpoint, status);
            this.metricsService.recordDuration(endpoint, duration);

            // Record errors (4xx and 5xx)
            if (status >= 400) {
                const errorType = status >= 500 ? 'server_error' : 'client_error';
                this.metricsService.incrementErrors(endpoint, errorType);
            }
        });

        next();
    }

    /**
     * Normalize endpoint to reduce cardinality
     * /personas/uuid-123 -> /personas/:id
     */
    private normalizeEndpoint(path: string): string {
        return path
            .replace(/\/[a-f0-9-]{36}/g, '/:id') // UUIDs
            .replace(/\/\d+/g, '/:id'); // Numeric IDs
    }
}
