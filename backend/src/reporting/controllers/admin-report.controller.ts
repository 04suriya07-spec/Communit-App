import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReportingService } from '../services/reporting.service';
import { AdminAuthGuard } from '../../moderation/guards/admin-auth.guard';
import { randomUUID } from 'crypto';

/**
 * Admin Report Controller
 * 
 * Internal admin endpoints for viewing reports
 */
@Controller('internal/moderation')
@UseGuards(AdminAuthGuard)
export class AdminReportController {
    constructor(private readonly reportingService: ReportingService) { }

    @Get('reports/:targetId')
    async getReportsForTarget(
        @Param('targetId') targetId: string,
        @Query('targetType') targetType: 'POST' | 'PERSONA'
    ): Promise<{
        target: {
            id: string;
            type: string;
        };
        reports: Array<{
            id: string;
            category: string;
            detail: string | null;
            createdAt: string;
        }>;
        totalReportCount: number;
        correlationId: string;
    }> {
        const result = await this.reportingService.getReportsForTarget({
            targetId,
            targetType,
        });

        return {
            ...result,
            correlationId: this.generateCorrelationId(),
        };
    }

    @Get('signals')
    async getAllSignals(
        @Query('limit') limit?: string,
        @Query('cursor') cursor?: string
    ): Promise<{
        signals: Array<{
            id: string;
            targetId: string;
            targetType: string;
            signalType: string;
            category: string;
            createdAt: string;
        }>;
        nextCursor?: string;
        correlationId: string;
    }> {
        const result = await this.reportingService.getAllSignals({
            limit: limit ? parseInt(limit, 10) : undefined,
            cursor,
        });

        return {
            ...result,
            correlationId: this.generateCorrelationId(),
        };
    }

    private generateCorrelationId(): string {
        return randomUUID();
    }
}
