import { Controller, Get, UseGuards } from '@nestjs/common';
import { MetricsService } from '../services/metrics.service';
import { AdminAuthGuard } from '../../moderation/guards/admin-auth.guard';

/**
 * Metrics Controller
 * 
 * Internal endpoint for Prometheus scraping
 */
@Controller('metrics')
@UseGuards(AdminAuthGuard) // Internal only
export class MetricsController {
    constructor(private readonly metricsService: MetricsService) { }

    /**
     * Prometheus metrics endpoint
     * GET /metrics
     */
    @Get()
    async getMetrics(): Promise<string> {
        return this.metricsService.getMetrics();
    }
}
