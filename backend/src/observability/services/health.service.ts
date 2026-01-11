import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Health Service
 * 
 * Provides health check endpoints for K8s/load balancers
 */
@Injectable()
export class HealthService {
    private startTime: number;

    constructor(private readonly prisma: PrismaClient) {
        this.startTime = Date.now();
    }

    /**
     * Liveness probe
     * Returns 200 if application is running
     */
    getLiveness(): { status: string; timestamp: string } {
        return {
            status: 'alive',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Readiness probe
     * Returns 200 if app can serve traffic
     * Checks database connectivity
     */
    async getReadiness(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        timestamp: string;
        uptime: number;
        checks: {
            database: {
                status: 'healthy' | 'unhealthy';
                responseTime?: number;
                error?: string;
            };
        };
    }> {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);

        // Check database
        const dbCheck = await this.checkDatabase();

        const overallStatus =
            dbCheck.status === 'healthy' ? 'healthy' : 'unhealthy';

        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime,
            checks: {
                database: dbCheck,
            },
        };
    }

    /**
     * Check database connectivity
     */
    private async checkDatabase(): Promise<{
        status: 'healthy' | 'unhealthy';
        responseTime?: number;
        error?: string;
    }> {
        try {
            const start = Date.now();

            // Simple query to check connectivity
            await this.prisma.$queryRaw`SELECT 1`;

            const responseTime = Date.now() - start;

            return {
                status: 'healthy',
                responseTime,
            };
        } catch (error: any) {
            return {
                status: 'unhealthy',
                error: error.message,
            };
        }
    }
}
