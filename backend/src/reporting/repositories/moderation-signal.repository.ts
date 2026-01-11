import { Injectable } from '@nestjs/common';
import { PrismaClient, Report } from '@prisma/client';
import { IModerationSignalRepository } from './moderation-signal.repository.interface';

/**
 * ModerationSignal Repository Implementation
 * 
 * Tracks user reports and moderation signals
 */
@Injectable()
export class ModerationSignalRepository implements IModerationSignalRepository {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * Create moderation signal
     */
    async create(data: {
        targetId: string;
        targetType: string;
        reporterPersonaId: string;
        reasonCategory: string;
        reasonDetail?: string;
    }): Promise<Report> {
        return this.prisma.report.create({
            data: {
                targetId: data.targetId,
                targetType: data.targetType,
                reporterPersonaId: data.reporterPersonaId,
                reason: data.reasonCategory, // Schema has 'reason' not 'reasonCategory'
            },
        });
    }

    /**
     * Find existing report (duplicate check)
     */
    async findByReporterAndTarget(
        reporterId: string,
        targetId: string
    ): Promise<Report | null> {
        return this.prisma.report.findFirst({
            where: {
                reporterPersonaId: reporterId,
                targetId,
            },
        });
    }

    /**
     * Count reports by reporter (spam detection)
     */
    async countByReporter(
        reporterId: string,
        options: { withinHours: number }
    ): Promise<number> {
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - options.withinHours);

        return this.prisma.report.count({
            where: {
                reporterPersonaId: reporterId,
                createdAt: {
                    gte: cutoffTime,
                },
            },
        });
    }

    /**
     * Count reports for target
     */
    async countByTarget(targetId: string, targetType: string): Promise<number> {
        return this.prisma.report.count({
            where: {
                targetId,
                targetType,
            },
        });
    }

    /**
     * Find reports by reporter
     */
    async findByReporter(
        reporterId: string,
        options: { limit: number; cursor?: Date }
    ): Promise<Report[]> {
        return this.prisma.report.findMany({
            where: {
                reporterPersonaId: reporterId,
                ...(options.cursor && {
                    createdAt: {
                        lt: options.cursor,
                    },
                }),
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: options.limit,
        });
    }

    /**
     * Find all reports for target
     */
    async findByTarget(targetId: string, targetType: string): Promise<Report[]> {
        return this.prisma.report.findMany({
            where: {
                targetId,
                targetType,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Find all signals (admin dashboard)
     */
    async findAll(options: { limit: number; cursor?: Date }): Promise<Report[]> {
        return this.prisma.report.findMany({
            where: options.cursor
                ? {
                    createdAt: {
                        lt: options.cursor,
                    },
                }
                : undefined,
            orderBy: {
                createdAt: 'desc',
            },
            take: options.limit,
        });
    }
}
