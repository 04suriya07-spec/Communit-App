import { Report } from '@prisma/client';

/**
 * ModerationSignal Repository Interface
 * 
 * Handles user reports and moderation signals
 */
export interface IModerationSignalRepository {
    /**
     * Create moderation signal (user report)
     */
    create(data: {
        targetId: string;
        targetType: string;
        reporterPersonaId: string;
        reasonCategory: string;
        reasonDetail?: string;
    }): Promise<Report>;

    /**
     * Find existing report by reporter and target
     * Used for duplicate prevention
     */
    findByReporterAndTarget(
        reporterId: string,
        targetId: string
    ): Promise<Report | null>;

    /**
     * Count reports by reporter within time window
     * Used for spam detection
     */
    countByReporter(
        reporterId: string,
        options: { withinHours: number }
    ): Promise<number>;

    /**
     * Count reports for a target
     * Used in moderation queue
     */
    countByTarget(targetId: string, targetType: string): Promise<number>;

    /**
     * Find reports by reporter (for "my reports" view)
     */
    findByReporter(
        reporterId: string,
        options: { limit: number; cursor?: Date }
    ): Promise<Report[]>;

    /**
     * Find all reports for a target (admin view)
     */
    findByTarget(targetId: string, targetType: string): Promise<Report[]>;

    /**
     * Find all signals (admin dashboard)
     */
    findAll(options: { limit: number; cursor?: Date }): Promise<Report[]>;
}
