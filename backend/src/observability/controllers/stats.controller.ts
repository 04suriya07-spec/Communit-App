import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../../moderation/guards/admin-auth.guard';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

/**
 * Stats Controller
 * 
 * Admin dashboard statistics endpoints
 */
@Controller('internal/system')
@UseGuards(AdminAuthGuard)
export class StatsController {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * Moderation statistics
     * GET /internal/system/moderation-stats
     */
    @Get('moderation-stats')
    async getModerationStats(): Promise<{
        queue: {
            pending: number;
            reviewed: number;
        };
        reports: {
            total: number;
            byCategory: Record<string, number>;
            last24Hours: number;
        };
        trustLevels: {
            NEW: number;
            REGULAR: number;
            TRUSTED: number;
        };
        riskLevels: {
            LOW: number;
            MEDIUM: number;
            HIGH: number;
        };
        correlationId: string;
    }> {
        // Queue stats (approximation - posts needing review)
        const pendingPosts = await this.prisma.publicContent.count({
            where: {
                moderationStatus: 'PENDING',
                deletedAt: null,
            },
        });

        const reviewedPosts = await this.prisma.publicContent.count({
            where: {
                moderationStatus: { in: ['APPROVED', 'REJECTED'] },
            },
        });

        // Report stats
        const totalReports = await this.prisma.report.count();

        // Simplified: removed groupBy due to Prisma type issue
        // const reportsByCategory = await this.prisma.report.groupBy...

        const last24HoursAgo = new Date();
        last24HoursAgo.setHours(last24HoursAgo.getHours() - 24);

        const reportsLast24Hours = await this.prisma.report.count({
            where: {
                createdAt: { gte: last24HoursAgo },
            },
        });

        // Trust level distribution
        const trustLevels = await this.prisma.trustLevel.groupBy({
            by: ['level'],
            _count: true,
        });

        const trustLevelMap = {
            NEW: trustLevels.find(t => t.level === 'NEW')?._count || 0,
            REGULAR: trustLevels.find(t => t.level === 'REGULAR')?._count || 0,
            TRUSTED: trustLevels.find(t => t.level === 'TRUSTED')?._count || 0,
        };

        // Risk level distribution
        const riskLevels = await this.prisma.accountabilityProfile.groupBy({
            by: ['riskLevel'],
            _count: true,
        });

        const riskLevelMap = {
            LOW: riskLevels.find(r => r.riskLevel === 'LOW')?._count || 0,
            MEDIUM: riskLevels.find(r => r.riskLevel === 'MEDIUM')?._count || 0,
            HIGH: riskLevels.find(r => r.riskLevel === 'HIGH')?._count || 0,
        };

        return {
            queue: {
                pending: pendingPosts,
                reviewed: reviewedPosts,
            },
            reports: {
                total: totalReports,
                byCategory: {}, // Removed - groupBy incompatible
                last24Hours: reportsLast24Hours,
            },
            trustLevels: trustLevelMap,
            riskLevels: riskLevelMap,
            correlationId: randomUUID(),
        };
    }

    /**
     * System statistics
     * GET /internal/system/system-stats
     */
    @Get('system-stats')
    async getSystemStats(): Promise<{
        users: {
            total: number;
            registeredLast24Hours: number;
            activePersonas: number;
        };
        content: {
            totalPosts: number;
            postsLast24Hours: number;
            deletedPosts: number;
        };
        correlationId: string;
    }> {
        const last24HoursAgo = new Date();
        last24HoursAgo.setHours(last24HoursAgo.getHours() - 24);

        // User stats
        const totalUsers = await this.prisma.accountabilityProfile.count();
        const usersLast24Hours = await this.prisma.accountabilityProfile.count({
            where: {
                createdAt: { gte: last24HoursAgo },
            },
        });
        const activePersonas = await this.prisma.persona.count({
            where: {
                isActive: true,
                deletedAt: null,
            },
        });

        // Content stats
        const totalPosts = await this.prisma.publicContent.count();
        const postsLast24Hours = await this.prisma.publicContent.count({
            where: {
                createdAt: { gte: last24HoursAgo },
            },
        });
        const deletedPosts = await this.prisma.publicContent.count({
            where: {
                deletedAt: { not: null },
            },
        });

        return {
            users: {
                total: totalUsers,
                registeredLast24Hours: usersLast24Hours,
                activePersonas,
            },
            content: {
                totalPosts,
                postsLast24Hours,
                deletedPosts,
            },
            correlationId: randomUUID(),
        };
    }
}
