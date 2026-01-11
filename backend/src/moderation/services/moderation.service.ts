import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AccountabilityProfileRepository } from '../../identity/repositories/accountability-profile.repository';
import { PersonaRepository } from '../../identity/repositories/persona.repository';
import { TrustLevelRepository } from '../../identity/repositories/trust-level.repository';
import { PublicContentRepository } from '../../posting/repositories/public-content.repository';
import { ModerationLogRepository } from '../repositories/moderation-log.repository';
import { RiskLevel, TrustLevelEnum } from '@prisma/client';

/**
 * Moderation Service
 * 
 * Internal-only tools for manual review and accountability management
 * Phase 1: No AI, no automation, full audit trail
 */
@Injectable()
export class ModerationService {
    constructor(
        private readonly accountabilityRepo: AccountabilityProfileRepository,
        private readonly personaRepo: PersonaRepository,
        private readonly trustLevelRepo: TrustLevelRepository,
        private readonly publicContentRepo: PublicContentRepository,
        private readonly moderationLogRepo: ModerationLogRepository,
    ) { }

    /**
     * View accountability profile with full context
     * Internal admin only
     */
    async getAccountabilityProfile(data: {
        accountabilityProfileId: string;
        moderatorId: string; // For audit logging
    }): Promise<{
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
    }> {
        // 1. Get accountability profile
        const accountability = await this.accountabilityRepo.findById(
            data.accountabilityProfileId
        );

        if (!accountability) {
            throw new NotFoundException('ACCOUNTABILITY_PROFILE_NOT_FOUND');
        }

        // 2. Get personas
        const personas = await this.personaRepo.findActiveByAccountabilityProfileId(
            data.accountabilityProfileId
        );

        const personasWithTrust = await Promise.all(
            personas.map(async (persona: any) => {
                const trustLevel = await this.trustLevelRepo.findByPersonaId(persona.id);
                return {
                    id: persona.id,
                    displayName: persona.displayName,
                    isActive: persona.isActive,
                    trustLevel: trustLevel?.level || 'NEW',
                    createdAt: persona.createdAt.toISOString(),
                };
            })
        );

        // 3. Get recent posts (last 10)
        const posts = await this.publicContentRepo.findByAccountabilityProfile(
            data.accountabilityProfileId
        );

        const recentPosts = posts.slice(0, 10).map((post: any) => ({
            id: post.id,
            body: post.body.substring(0, 200) + (post.body.length > 200 ? '...' : ''),
            personaDisplayName: post.persona.displayName,
            createdAt: post.createdAt.toISOString(),
        }));

        // 4. Get moderation history
        const moderationLogs = await this.moderationLogRepo.findByTarget(
            data.accountabilityProfileId,
            'ACCOUNTABILITY_PROFILE'
        );

        const moderationHistory = moderationLogs.slice(0, 20).map((log: any) => ({
            action: log.action,
            reason: log.reason,
            moderatorEmail: log.moderator.email,
            createdAt: log.createdAt.toISOString(),
        }));

        // 5. Log view action (audit trail)
        await this.moderationLogRepo.create({
            targetId: data.accountabilityProfileId,
            targetType: 'ACCOUNTABILITY_PROFILE',
            moderatorId: data.moderatorId,
            action: 'VIEWED',
            reason: 'Admin dashboard access',
        });

        return {
            id: accountability.id,
            globalAbuseScore: accountability.globalAbuseScore,
            riskLevel: accountability.riskLevel,
            isVerified: accountability.isVerified,
            createdAt: accountability.createdAt.toISOString(),
            personas: personasWithTrust,
            recentPosts,
            moderationHistory,
        };
    }

    /**
     * Update trust level (manual promotion/demotion)
     */
    async updateTrustLevel(data: {
        personaId: string;
        newLevel: 'NEW' | 'REGULAR' | 'TRUSTED';
        reason: string;
        moderatorId: string;
        moderatorRole: string;
    }): Promise<{
        personaId: string;
        oldLevel: string;
        newLevel: string;
        updatedAt: string;
        moderationLogId: string;
    }> {
        // 1. Verify moderator has permission (all roles can update trust levels)
        // Future: Add role-specific constraints if needed

        // 2. Get current trust level
        const currentTrustLevel = await this.trustLevelRepo.findByPersonaId(data.personaId);

        if (!currentTrustLevel) {
            throw new NotFoundException('PERSONA_NOT_FOUND');
        }

        const oldLevel = currentTrustLevel.level;

        // 3. Create new trust level record
        const newTrustLevel = await this.trustLevelRepo.update(
            data.personaId,
            data.newLevel
        );

        // 4. Log action
        const moderationLog = await this.moderationLogRepo.create({
            targetId: data.personaId,
            targetType: 'PERSONA',
            moderatorId: data.moderatorId,
            action: 'TRUST_LEVEL_UPDATED',
            reason: data.reason,
            explanationLog: `Changed from ${oldLevel} to ${data.newLevel}`,
        });

        return {
            personaId: data.personaId,
            oldLevel,
            newLevel: data.newLevel,
            updatedAt: newTrustLevel.grantedAt.toISOString(),
            moderationLogId: moderationLog.id,
        };
    }

    /**
     * Update abuse score (admin only)
     */
    async updateAbuseScore(data: {
        accountabilityProfileId: string;
        newScore: number;
        reason: string;
        moderatorId: string;
        moderatorRole: string;
    }): Promise<{
        accountabilityProfileId: string;
        oldScore: number;
        newScore: number;
        oldRiskLevel: string;
        newRiskLevel: string;
        updatedAt: string;
    }> {
        // 1. Verify moderator is ADMIN or SUPER_ADMIN
        if (data.moderatorRole !== 'ADMIN' && data.moderatorRole !== 'SUPER_ADMIN') {
            throw new ForbiddenException('INSUFFICIENT_PERMISSIONS');
        }

        // 2. Validate score range
        if (data.newScore < 0 || data.newScore > 1) {
            throw new ForbiddenException('INVALID_ABUSE_SCORE');
        }

        // 3. Get current state
        const accountability = await this.accountabilityRepo.findById(
            data.accountabilityProfileId
        );

        if (!accountability) {
            throw new NotFoundException('ACCOUNTABILITY_PROFILE_NOT_FOUND');
        }

        const oldScore = accountability.globalAbuseScore;
        const oldRiskLevel = accountability.riskLevel;

        // 4. Update score
        const updated = await this.accountabilityRepo.updateAbuseScore(
            data.accountabilityProfileId,
            data.newScore
        );

        // 5. Auto-adjust risk level based on thresholds
        let newRiskLevel: RiskLevel;
        if (data.newScore < 0.3) {
            newRiskLevel = RiskLevel.LOW;
        } else if (data.newScore < 0.7) {
            newRiskLevel = RiskLevel.MEDIUM;
        } else {
            newRiskLevel = RiskLevel.HIGH;
        }

        // Update risk level if changed
        if (newRiskLevel !== oldRiskLevel) {
            await this.accountabilityRepo.updateRiskLevel(
                data.accountabilityProfileId,
                newRiskLevel
            );
        }

        // 6. Log action
        await this.moderationLogRepo.create({
            targetId: data.accountabilityProfileId,
            targetType: 'ACCOUNTABILITY_PROFILE',
            moderatorId: data.moderatorId,
            action: 'ABUSE_SCORE_UPDATED',
            reason: data.reason,
            explanationLog: `Score: ${oldScore} → ${data.newScore}, Risk: ${oldRiskLevel} → ${newRiskLevel}`,
        });

        return {
            accountabilityProfileId: data.accountabilityProfileId,
            oldScore,
            newScore: data.newScore,
            oldRiskLevel,
            newRiskLevel,
            updatedAt: new Date().toISOString(),
        };
    }

    /**
     * Get moderation queue (posts requiring review)
     * Phase 1: All posts auto-approved, but this allows retroactive review
     */
    async getModerationQueue(params: {
        status?: 'PENDING' | 'APPROVED' | 'REJECTED';
        limit?: number;
        cursor?: string;
    }): Promise<{
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
    }> {
        const limit = Math.min(params.limit || 20, 100);
        const cursor = params.cursor ? new Date(params.cursor) : undefined;

        // Get posts with persona and accountability context
        const posts = await this.publicContentRepo.findPublicFeed({
            limit: limit + 1,
            cursor,
        });

        const hasMore = posts.length > limit;
        const postsToReturn = hasMore ? posts.slice(0, limit) : posts;

        // Enrich with accountability context
        const enrichedPosts = await Promise.all(
            postsToReturn.map(async (post: any) => {
                const persona = await this.personaRepo.findById(post.personaId);
                const accountability = persona
                    ? await this.accountabilityRepo.findById(persona.accountabilityProfileId)
                    : null;
                const trustLevel = await this.trustLevelRepo.findByPersonaId(post.personaId);

                return {
                    id: post.id,
                    body: post.body,
                    author: {
                        personaId: post.persona.id,
                        displayName: post.persona.displayName,
                        trustLevel: trustLevel?.level || 'NEW',
                        accountabilityRiskLevel: accountability?.riskLevel || 'LOW',
                    },
                    moderationStatus: post.moderationStatus,
                    createdAt: post.createdAt.toISOString(),
                };
            })
        );

        return {
            posts: enrichedPosts,
            nextCursor: hasMore
                ? postsToReturn[postsToReturn.length - 1].createdAt.toISOString()
                : undefined,
        };
    }

    /**
     * Take moderation action on post
     */
    async moderatePost(data: {
        postId: string;
        action: 'APPROVE' | 'REJECT' | 'FLAG';
        reason: string;
        explanationLog: string;
        moderatorId: string;
    }): Promise<{
        postId: string;
        action: string;
        moderationLogId: string;
        actedAt: string;
    }> {
        // 1. Get post
        const post = await this.publicContentRepo.findById(data.postId);

        if (!post) {
            throw new NotFoundException('POST_NOT_FOUND');
        }

        // 2. If REJECT, soft delete the post
        if (data.action === 'REJECT') {
            await this.publicContentRepo.softDelete(data.postId);
        }

        // 3. Log action
        const moderationLog = await this.moderationLogRepo.create({
            targetId: data.postId,
            targetType: 'POST',
            moderatorId: data.moderatorId,
            action: data.action,
            reason: data.reason,
            explanationLog: data.explanationLog,
        });

        return {
            postId: data.postId,
            action: data.action,
            moderationLogId: moderationLog.id,
            actedAt: moderationLog.createdAt.toISOString(),
        };
    }
}
