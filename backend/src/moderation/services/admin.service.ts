import { Injectable } from '@nestjs/common';
import { InternalAdminRepository } from '../repositories/internal-admin.repository';
import { ModerationLogRepository } from '../repositories/moderation-log.repository';

/**
 * Admin Service
 * 
 * Manages internal admin accounts and audit history
 */
@Injectable()
export class AdminService {
    constructor(
        private readonly adminRepo: InternalAdminRepository,
        private readonly moderationLogRepo: ModerationLogRepository,
    ) { }

    /**
     * List all admins with optional filters
     */
    async listAdmins(filters?: {
        role?: string;
        isActive?: boolean;
    }): Promise<{
        admins: Array<{
            id: string;
            email: string;
            role: string;
            isActive: boolean;
            createdAt: string;
        }>;
    }> {
        const admins = await this.adminRepo.findAll(filters);

        return {
            admins: admins.map(admin => ({
                id: admin.id,
                email: admin.email,
                role: admin.role,
                isActive: admin.isActive,
                createdAt: admin.createdAt.toISOString(),
            })),
        };
    }

    /**
     * Get moderation history (audit trail)
     */
    async getModerationHistory(params: {
        targetId?: string;
        targetType?: string;
        moderatorId?: string;
        limit?: number;
        cursor?: string;
    }): Promise<{
        logs: Array<{
            id: string;
            targetId: string;
            targetType: string;
            action: string;
            reason: string;
            explanationLog: string | null;
            moderator: {
                id: string;
                email: string;
            };
            isDryRun: boolean;
            createdAt: string;
        }>;
        nextCursor?: string;
    }> {
        const limit = Math.min(params.limit || 20, 100);
        const cursor = params.cursor ? new Date(params.cursor) : undefined;

        // Get logs (filtering handled in future enhancement)
        const logs = await this.moderationLogRepo.findRecent({
            limit: limit + 1,
            cursor,
        });

        const hasMore = logs.length > limit;
        const logsToReturn = hasMore ? logs.slice(0, limit) : logs;

        return {
            logs: logsToReturn.map((log: any) => ({
                id: log.id,
                targetId: log.targetId,
                targetType: log.targetType,
                action: log.action,
                reason: log.reason,
                explanationLog: log.explanationLog,
                moderator: {
                    id: log.moderator.id,
                    email: log.moderator.email,
                },
                isDryRun: log.isDryRun,
                createdAt: log.createdAt.toISOString(),
            })),
            nextCursor: hasMore
                ? logsToReturn[logsToReturn.length - 1].createdAt.toISOString()
                : undefined,
        };
    }
}
