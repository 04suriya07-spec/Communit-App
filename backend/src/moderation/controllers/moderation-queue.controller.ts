import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ModerationService } from '../services/moderation.service';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { Request } from 'express';
import { randomUUID } from 'crypto';

/**
 * Moderation Queue Controller
 * 
 * Internal admin endpoints for reviewing and moderating content
 */
@Controller('internal/moderation')
@UseGuards(AdminAuthGuard)
export class ModerationQueueController {
    constructor(private readonly moderationService: ModerationService) { }

    @Post('trust-level')
    async updateTrustLevel(
        @Body() dto: {
            personaId: string;
            newLevel: 'NEW' | 'REGULAR' | 'TRUSTED';
            reason: string;
        },
        @Req() req: Request
    ): Promise<{
        personaId: string;
        oldLevel: string;
        newLevel: string;
        updatedAt: string;
        moderationLogId: string;
        correlationId: string;
    }> {
        const adminId = (req as any).adminId;
        const adminRole = (req as any).adminRole;

        const result = await this.moderationService.updateTrustLevel({
            personaId: dto.personaId,
            newLevel: dto.newLevel,
            reason: dto.reason,
            moderatorId: adminId,
            moderatorRole: adminRole,
        });

        return {
            ...result,
            correlationId: this.generateCorrelationId(),
        };
    }

    @Post('abuse-score')
    async updateAbuseScore(
        @Body() dto: {
            accountabilityProfileId: string;
            newScore: number;
            reason: string;
        },
        @Req() req: Request
    ): Promise<{
        accountabilityProfileId: string;
        oldScore: number;
        newScore: number;
        oldRiskLevel: string;
        newRiskLevel: string;
        updatedAt: string;
        correlationId: string;
    }> {
        const adminId = (req as any).adminId;
        const adminRole = (req as any).adminRole;

        const result = await this.moderationService.updateAbuseScore({
            accountabilityProfileId: dto.accountabilityProfileId,
            newScore: dto.newScore,
            reason: dto.reason,
            moderatorId: adminId,
            moderatorRole: adminRole,
        });

        return {
            ...result,
            correlationId: this.generateCorrelationId(),
        };
    }

    @Get('queue')
    async getModerationQueue(
        @Query('status') status?: 'PENDING' | 'APPROVED' | 'REJECTED',
        @Query('limit') limit?: string,
        @Query('cursor') cursor?: string
    ): Promise<{
        posts: Array<{
            id: string;
            body: string;
            author: {
                personaId: string;
                displayName: string;
                trustLevel: string;
                accountabilityRiskLevel: string;
            };
            moderationStatus: string;
            createdAt: string;
        }>;
        nextCursor?: string;
        correlationId: string;
    }> {
        const result = await this.moderationService.getModerationQueue({
            status,
            limit: limit ? parseInt(limit, 10) : undefined,
            cursor,
        });

        return {
            ...result,
            correlationId: this.generateCorrelationId(),
        };
    }

    @Post('posts/:id/action')
    async moderatePost(
        @Param('id') postId: string,
        @Body() dto: {
            action: 'APPROVE' | 'REJECT' | 'FLAG';
            reason: string;
            explanationLog: string;
        },
        @Req() req: Request
    ): Promise<{
        postId: string;
        action: string;
        moderationLogId: string;
        actedAt: string;
        correlationId: string;
    }> {
        const adminId = (req as any).adminId;

        const result = await this.moderationService.moderatePost({
            postId,
            action: dto.action,
            reason: dto.reason,
            explanationLog: dto.explanationLog,
            moderatorId: adminId,
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
