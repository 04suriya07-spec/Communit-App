import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { randomUUID } from 'crypto';

/**
 * Admin Controller
 * 
 * Internal endpoints for admin management and audit history
 */
@Controller('internal/moderation')
@UseGuards(AdminAuthGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('admins')
    async listAdmins(
        @Query('role') role?: string,
        @Query('isActive') isActive?: string
    ): Promise<{
        admins: Array<{
            id: string;
            email: string;
            role: string;
            isActive: boolean;
            createdAt: string;
        }>;
        correlationId: string;
    }> {
        const result = await this.adminService.listAdmins({
            role,
            isActive: isActive !== undefined ? isActive === 'true' : undefined,
        });

        return {
            ...result,
            correlationId: this.generateCorrelationId(),
        };
    }

    @Get('logs')
    async getModerationHistory(
        @Query('targetId') targetId?: string,
        @Query('targetType') targetType?: string,
        @Query('moderatorId') moderatorId?: string,
        @Query('limit') limit?: string,
        @Query('cursor') cursor?: string
    ): Promise<{
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
        correlationId: string;
    }> {
        const result = await this.adminService.getModerationHistory({
            targetId,
            targetType,
            moderatorId,
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
