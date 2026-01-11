import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { LogContext } from '../interfaces/log-context.interface';

/**
 * Logger Service
 * 
 * Structured logging with JSON format
 * Privacy-safe: No PII (emails, display names, IPs)
 */
@Injectable()
export class LoggerService {
    private logger: winston.Logger;

    constructor() {
        const isProduction = process.env.NODE_ENV === 'production';

        this.logger = winston.createLogger({
            level: isProduction ? 'info' : 'debug',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            defaultMeta: { service: 'community-app' },
            transports: [
                // Console output
                new winston.transports.Console({
                    format: isProduction
                        ? winston.format.json()
                        : winston.format.combine(
                            winston.format.colorize(),
                            winston.format.simple()
                        ),
                }),
                // File output (production)
                ...(isProduction
                    ? [
                        new winston.transports.File({
                            filename: 'logs/error.log',
                            level: 'error',
                        }),
                        new winston.transports.File({
                            filename: 'logs/combined.log',
                        }),
                    ]
                    : []),
            ],
        });
    }

    info(message: string, context?: LogContext) {
        this.logger.info(message, this.sanitizeContext(context));
    }

    warn(message: string, context?: LogContext) {
        this.logger.warn(message, this.sanitizeContext(context));
    }

    error(message: string, error?: Error, context?: LogContext) {
        this.logger.error(message, {
            ...this.sanitizeContext(context),
            ...(error && {
                error: error.message,
                stack: error.stack,
            }),
        });
    }

    debug(message: string, context?: LogContext) {
        this.logger.debug(message, this.sanitizeContext(context));
    }

    /**
     * Sanitize context to remove PII
     * ❌ NO: email, displayName, ipAddress
     * ✅ YES: UUIDs, endpoints, status codes
     */
    private sanitizeContext(context?: LogContext): LogContext {
        if (!context) return {};

        const sanitized = { ...context };

        // Remove PII fields
        delete sanitized['email'];
        delete sanitized['displayName'];
        delete sanitized['ipAddress'];
        delete sanitized['encryptedEmail'];

        return sanitized;
    }
}
