import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SessionConfigService } from '../services/session-config.service';

/**
 * Session Validation Middleware
 * 
 * Validates session integrity (fingerprint check)
 */
@Injectable()
export class SessionValidationMiddleware implements NestMiddleware {
    constructor(private readonly sessionConfig: SessionConfigService) { }

    use(req: Request, res: Response, next: NextFunction) {
        const session = (req as any).session;

        // Skip if no session
        if (!session || !session.userId) {
            return next();
        }

        // Check fingerprint on existing sessions
        if (session.fingerprint) {
            const isValid = this.sessionConfig.validateFingerprint(req, session.fingerprint);

            if (!isValid) {
                // Session hijacking detected - destroy session
                this.sessionConfig.destroySession(req);
                throw new UnauthorizedException('SESSION_INVALID');
            }
        } else {
            // First request - set fingerprint
            session.fingerprint = this.sessionConfig.generateFingerprint(req);
        }

        next();
    }
}
