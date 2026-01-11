import { Injectable } from '@nestjs/common';
import { PrismaClient, ModerationLog } from '@prisma/client';
import { IModerationLogRepository } from './moderation-log.repository.interface';

/**
 * ModerationLog Repository Implementation
 * 
 * Full audit trail for all moderation actions
 */
@Injectable()
export class ModerationLogRepository implements IModerationLogRepository {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * Create moderation log entry
     */
    async create(data: {
        targetId: string;
        targetType: string;
        moderatorId: string;
        action: string;
        reason: string;
        explanationLog?: string;
        isDryRun?: boolean;
        originEventId?: string;
        legalHold?: boolean;
        retentionUntil?: Date;
    }): Promise<ModerationLog> {
        return this.prisma.moderationLog.create({
            data: {
                targetId: data.targetId,
                targetType: data.targetType,
                moderatorId: data.moderatorId,
                action: data.action,
                reason: data.reason,
                explanationLog: data.explanationLog,
                isDryRun: data.isDryRun ?? false,
                originEventId: data.originEventId,
                legalHold: data.legalHold ?? false,
                retentionUntil: data.retentionUntil,
            },
        });
    }

    /**
     * Find log by ID
     */
    async findById(id: string): Promise<ModerationLog | null> {
        return this.prisma.moderationLog.findUnique({
            where: { id },
            include: {
                moderator: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
    }

    /**
     * Find logs for specific target
     */
    async findByTarget(targetId: string, targetType: string): Promise<ModerationLog[]> {
        return this.prisma.moderationLog.findMany({
            where: {
                targetId,
                targetType,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                moderator: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
    }

    /**
     * Find logs by moderator
     */
    async findByModerator(moderatorId: string): Promise<ModerationLog[]> {
        return this.prisma.moderationLog.findMany({
            where: { moderatorId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Find recent logs (for dashboard)
     */
    async findRecent(params: {
        limit: number;
        cursor?: Date;
    }): Promise<ModerationLog[]> {
        return this.prisma.moderationLog.findMany({
            where: params.cursor
                ? {
                    createdAt: {
                        lt: params.cursor,
                    },
                }
                : undefined,
            orderBy: {
                createdAt: 'desc',
            },
            take: params.limit,
            include: {
                moderator: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
    }
}
