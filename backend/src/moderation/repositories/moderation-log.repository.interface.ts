import { ModerationLog } from '@prisma/client';

/**
 * ModerationLog Repository Interface
 * 
 * Tracks all moderation actions for audit trail
 */
export interface IModerationLogRepository {
    /**
     * Create moderation log entry
     */
    create(data: {
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
    }): Promise<ModerationLog>;

    /**
     * Find log by ID
     */
    findById(id: string): Promise<ModerationLog | null>;

    /**
     * Find logs for specific target
     */
    findByTarget(targetId: string, targetType: string): Promise<ModerationLog[]>;

    /**
     * Find logs by moderator
     */
    findByModerator(moderatorId: string): Promise<ModerationLog[]>;

    /**
     * Find recent logs (for dashboard)
     */
    findRecent(params: {
        limit: number;
        cursor?: Date;
    }): Promise<ModerationLog[]>;
}
