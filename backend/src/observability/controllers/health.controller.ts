import { Controller, Get } from '@nestjs/common';
import { HealthService } from '../services/health.service';

/**
 * Health Controller
 * 
 * K8s/load balancer health check endpoints
 */
@Controller('health')
export class HealthController {
    constructor(private readonly healthService: HealthService) { }

    /**
     * Liveness probe
     * GET /health/live
     */
    @Get('live')
    getLiveness(): { status: string; timestamp: string } {
        return this.healthService.getLiveness();
    }

    /**
     * Readiness probe
     * GET /health/ready
     */
    @Get('ready')
    async getReadiness(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        checks: any;
    }> {
        return this.healthService.getReadiness();
    }
}
