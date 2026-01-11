import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

// Services
import { SessionConfigService } from './services/session-config.service';
import { EncryptionService } from './services/encryption.service';

// Middleware
import { SessionValidationMiddleware } from './middleware/session-validation.middleware';

/**
 * Security Module
 * 
 * Provides session management, CSRF protection, and security middleware
 */
@Module({
    providers: [
        SessionConfigService,
        EncryptionService,
        SessionValidationMiddleware,
    ],
    exports: [
        SessionConfigService,
        EncryptionService,
    ],
})
export class SecurityModule implements NestModule {
    constructor(private readonly sessionConfig: SessionConfigService) { }

    configure(consumer: MiddlewareConsumer) {
        // User session middleware (all public routes)
        consumer
            .apply(
                this.sessionConfig.getUserSessionMiddleware(),
                SessionValidationMiddleware
            )
            .forRoutes('*');

        // Admin session middleware (internal routes only)
        consumer
            .apply(
                this.sessionConfig.getAdminSessionMiddleware(),
                SessionValidationMiddleware
            )
            .forRoutes('/api/v1/internal/(.*)');
    }
}
