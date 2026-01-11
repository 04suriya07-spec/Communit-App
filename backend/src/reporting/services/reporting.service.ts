import { Injectable, ForbiddenException, ConflictException, NotFoundException } from '@nestjs/common';
import { ModerationSignalRepository } from '../repositories/moderation-signal.repository';
import { PublicContentRepository } from '../../posting/repositories/public-content.repository';
import { PersonaRepository } from '../../identity/repositories/persona.repository';

/**
 * Reporting Service
 * 
 * Handles user-generated reports for Trust & Safety review
 * Phase 1: No automated enforcement, signals only
 */
@Injectable()
export class ReportingService {
    constructor(
        private readonly moderationSignalRepo: ModerationSignalRepository,
        private readonly publicContentRepo: PublicContentRepository,
        private readonly personaRepo: PersonaRepository,
    ) { }

    /**
     * Submit report (user action)
     */
    async submitReport(data: {
        targetId: string;
        targetType: 'POST' | 'PERSONA';
        category: string;
        detail?: string;
        reporterPersonaId: string; // From session
    }): Promise<{
        submitted: boolean;
        message: string;
    }> {
        // 1. Verify target exists
        await this.verifyTargetExists(data.targetId, data.targetType);

        // 2. Check for duplicate report
        const existing = await this.moderationSignalRepo.findByReporterAndTarget(
            data.reporterPersonaId,
            data.targetId
        );

        if (existing) {
            return {
                submitted: false,
                message: 'You have already reported this content',
            };
        }

        // 3. Check spam reporting rate limit
        const recentReports = await this.moderationSignalRepo.countByReporter(
            data.reporterPersonaId,
            { withinHours: 1 }
        );

        if (recentReports >= 10) {
            throw new ForbiddenException('REPORT_RATE_LIMIT_EXCEEDED');
        }

        // 4. Create moderation signal
        await this.moderationSignalRepo.create({
            targetId: data.targetId,
            targetType: data.targetType,
            reporterPersonaId: data.reporterPersonaId,
            reasonCategory: data.category,
        });

        return {
            submitted: true,
            message: 'Report submitted for review',
        };
    }

    /**
     * Get user's own reports
     */
    async getUserReports(params: {
        reporterPersonaId: string;
        limit?: number;
        cursor?: string;
    }): Promise<{
        reports: Array<{
            id: string;
            targetType: string;
            category: string;
            status: 'PENDING' | 'REVIEWED';
            submittedAt: string;
        }>;
        nextCursor?: string;
    }> {
        const limit = Math.min(params.limit || 20, 100);
        const cursor = params.cursor ? new Date(params.cursor) : undefined;

        const signals = await this.moderationSignalRepo.findByReporter(
            params.reporterPersonaId,
            {
                limit: limit + 1,
                cursor,
            }
        );

        const hasMore = signals.length > limit;
        const signalsToReturn = hasMore ? signals.slice(0, limit) : signals;

        return {
            reports: signalsToReturn.map(signal => ({
                id: signal.id,
                targetType: signal.targetType,
                category: signal.reason,
                status: 'PENDING', // TODO: Link to moderation_logs to get actual status
                submittedAt: signal.createdAt.toISOString(),
            })),
            nextCursor: hasMore
                ? signalsToReturn[signalsToReturn.length - 1].createdAt.toISOString()
                : undefined,
        };
    }

    /**
     * Get reports for target (admin only)
     */
    async getReportsForTarget(data: {
        targetId: string;
        targetType: 'POST' | 'PERSONA';
    }): Promise<{
        target: {
            id: string;
            type: string;
        };
        reports: Array<{
            id: string;
            category: string;
            detail: string | null;
            createdAt: string;
            // NO reporter identity (privacy)
        }>;
        totalReportCount: number;
    }> {
        const signals = await this.moderationSignalRepo.findByTarget(
            data.targetId,
            data.targetType
        );

        return {
            target: {
                id: data.targetId,
                type: data.targetType,
            },
            reports: signals.map(signal => ({
                id: signal.id,
                category: signal.reason,
                detail: null, // Not in schema
                createdAt: signal.createdAt.toISOString(),
                // ❌ NO reporterAccountabilityId (privacy)
            })),
            totalReportCount: signals.length,
        };
    }

    /**
     * Get all signals (admin dashboard)
     */
    async getAllSignals(params: {
        limit?: number;
        cursor?: string;
    }): Promise<{
        signals: Array<{
            id: string;
            targetId: string;
            targetType: string;
            signalType: string;
            category: string;
            createdAt: string;
        }>;
        nextCursor?: string;
    }> {
        const limit = Math.min(params.limit || 20, 100);
        const cursor = params.cursor ? new Date(params.cursor) : undefined;

        const signals = await this.moderationSignalRepo.findAll({
            limit: limit + 1,
            cursor,
        });

        const hasMore = signals.length > limit;
        const signalsToReturn = hasMore ? signals.slice(0, limit) : signals;

        return {
            signals: signalsToReturn.map(signal => ({
                id: signal.id,
                targetId: signal.targetId,
                targetType: signal.targetType,
                signalType: 'USER_REPORT', // Not in schema, hardcoded
                category: signal.reason,
                createdAt: signal.createdAt.toISOString(),
            })),
            nextCursor: hasMore
                ? signalsToReturn[signalsToReturn.length - 1].createdAt.toISOString()
                : undefined,
        };
    }

    /**
     * Verify target exists
     */
    private async verifyTargetExists(
        targetId: string,
        targetType: 'POST' | 'PERSONA'
    ): Promise<void> {
        if (targetType === 'POST') {
            const post = await this.publicContentRepo.findById(targetId);
            if (!post) {
                throw new NotFoundException('POST_NOT_FOUND');
            }
        } else if (targetType === 'PERSONA') {
            const persona = await this.personaRepo.findById(targetId);
            if (!persona) {
                throw new NotFoundException('PERSONA_NOT_FOUND');
            }
        }
    }
}
