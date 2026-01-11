import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ModerationService } from '../services/moderation.service';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { Request } from 'express';
import { randomUUID } from 'crypto';

/**
 * Accountability Controller
 * 
 * Internal admin endpoints for viewing accountability profiles
 */
@Controller('internal/moderation/accountability')
@UseGuards(AdminAuthGuard)
export class AccountabilityController {
    constructor(private readonly moderationService: ModerationService) { }

    @Get(':id')
    async getAccountabilityProfile(
        @Param('id') accountabilityProfileId: string,
        @Req() req: Request
    ): Promise<{
        id: string;
        globalAbuseScore: number;
        riskLevel: string;
        isVerified: boolean;
        createdAt: string;
        personas: Array<{
            id: string;
            displayName: string;
            isActive: boolean;
            trustLevel: string;
            createdAt: string;
        }>;
        recentPosts: Array<{
            id: string;
            body: string;
            personaDisplayName: string;
            createdAt: string;
        }>;
        moderationHistory: Array<{
            action: string;
            reason: string;
            moderatorEmail: string;
            createdAt: string;
        }>;
        correlationId: string;
    }> {
        const adminId = (req as any).adminId;

        const result = await this.moderationService.getAccountabilityProfile({
            accountabilityProfileId,
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
