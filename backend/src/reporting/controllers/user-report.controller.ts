import { Controller, Post, Get, Body, Query, Req } from '@nestjs/common';
import { ReportingService } from '../services/reporting.service';
import { Request } from 'express';
import { randomUUID } from 'crypto';

/**
 * User Report Controller
 * 
 * Handles user-submitted reports
 */
@Controller('reports')
export class UserReportController {
    constructor(private readonly reportingService: ReportingService) { }

    @Post()
    async submitReport(
        @Body() dto: {
            targetId: string;
            targetType: 'POST' | 'PERSONA';
            category: string;
            detail?: string;
        },
        @Req() req: Request
    ): Promise<{
        submitted: boolean;
        message: string;
        correlationId: string;
    }> {
        const session = (req as any).session;
        if (!session?.accountabilityProfileId) {
            throw new Error('Unauthorized');
        }

        const result = await this.reportingService.submitReport({
            targetId: dto.targetId,
            targetType: dto.targetType,
            category: dto.category,
            detail: dto.detail,
            reporterPersonaId: session.accountabilityProfileId,
        });

        return {
            ...result,
            correlationId: this.generateCorrelationId(),
        };
    }

    @Get('me')
    async getMyReports(
        @Query('limit') limit?: string,
        @Query('cursor') cursor?: string,
        @Req() req?: Request
    ): Promise<{
        reports: Array<{
            id: string;
            targetType: string;
            category: string;
            status: string;
            submittedAt: string;
        }>;
        nextCursor?: string;
        correlationId: string;
    }> {
        const session = (req as any).session;
        if (!session?.accountabilityProfileId) {
            throw new Error('Unauthorized');
        }

        const result = await this.reportingService.getUserReports({
            reporterPersonaId: session.accountabilityProfileId,
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
