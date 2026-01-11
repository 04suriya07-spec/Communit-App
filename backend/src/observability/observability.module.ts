import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Services
import { LoggerService } from './services/logger.service';
import { MetricsService } from './services/metrics.service';
import { HealthService } from './services/health.service';

// Middleware
import { CorrelationIdMiddleware } from './middleware/correlation-id.middleware';
import { MetricsMiddleware } from './middleware/metrics.middleware';

// Controllers
import { HealthController } from './controllers/health.controller';
import { MetricsController } from './controllers/metrics.controller';
import { StatsController } from './controllers/stats.controller';

// Guards
import { AdminAuthGuard } from '../moderation/guards/admin-auth.guard';

/**
 * Observability Module
 * 
 * Provides logging, metrics, and health checks
 */
@Module({
    providers: [
        // Prisma
        {
            provide: PrismaClient,
            useFactory: () => {
                return new PrismaClient();
            },
        },

        // Services
        LoggerService,
        MetricsService,
        HealthService,

        // Guards
        AdminAuthGuard,
    ],
    controllers: [
        HealthController,
        MetricsController,
        StatsController,
    ],
    exports: [
        LoggerService,
        MetricsService,
        HealthService,
    ],
})
export class ObservabilityModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        // Apply correlation ID middleware to all routes
        consumer.apply(CorrelationIdMiddleware).forRoutes('*');

        // Apply metrics middleware to all routes
        consumer.apply(MetricsMiddleware).forRoutes('*');
    }
}
