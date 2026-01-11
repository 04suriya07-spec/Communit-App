import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PublicContentRepository } from '../repositories/public-content.repository';
import { PersonaRepository } from '../../identity/repositories/persona.repository';
import { TrustLevelRepository } from '../../identity/repositories/trust-level.repository';
import { PolicyEngineService } from '../../policy/services/policy-engine.service';

/**
 * Post Service
 * 
 * Handles public posting with persona-scoped authorship
 * Phase 1: Text-only, no moderation, hardcoded rate limits
 */
@Injectable()
export class PostService {
    constructor(
        private readonly publicContentRepo: PublicContentRepository,
        private readonly personaRepo: PersonaRepository,
        private readonly trustLevelRepo: TrustLevelRepository,
        private readonly policyEngine: PolicyEngineService,
    ) { }

    /**
     * Create new post
     * Enforces: persona ownership, active status, rate limits, body length
     */
    async createPost(data: {
        personaId: string;
        body: string;
        accountabilityProfileId: string; // From session
    }): Promise<{
        postId: string;
        createdAt: string;
    }> {
        // 1. Validate body length (policy-driven)
        const minLength = this.policyEngine.getNumericValue('post_body_min_length');
        const maxLength = this.policyEngine.getNumericValue('post_body_max_length');

        if (!data.body || data.body.trim().length < minLength) {
            throw new BadRequestException('BODY_EMPTY');
        }
        if (data.body.length > maxLength) {
            throw new BadRequestException('BODY_TOO_LONG');
        }

        // 2. Verify persona ownership
        const persona = await this.personaRepo.findById(data.personaId);
        if (!persona || persona.accountabilityProfileId !== data.accountabilityProfileId) {
            throw new ForbiddenException('PERSONA_NOT_OWNED');
        }

        // 3. Verify persona is active
        if (!persona.isActive || persona.deletedAt) {
            throw new ForbiddenException('PERSONA_INACTIVE');
        }

        // 4. Check rate limit (policy-driven)
        await this.checkRateLimit(data.personaId, data.accountabilityProfileId);

        // 5. Create post
        const post = await this.publicContentRepo.create({
            personaId: data.personaId,
            body: data.body.trim(),
        });

        // 6. Return public data only
        return {
            postId: post.id,
            createdAt: post.createdAt.toISOString(),
        };
    }

    /**
     * Get public feed (all non-deleted posts)
     */
    async getPublicFeed(params: {
        limit?: number;
        cursor?: string;
    }): Promise<{
        posts: Array<{
            id: string;
            body: string;
            author: {
                personaId: string;
                displayName: string;
                // NO accountabilityProfileId
            };
            createdAt: string;
        }>;
        nextCursor?: string;
    }> {
        const limit = Math.min(params.limit || 20, 100); // Max 100
        const cursor = params.cursor ? new Date(params.cursor) : undefined;

        const posts = await this.publicContentRepo.findPublicFeed({
            limit: limit + 1, // Fetch one extra to determine if there's more
            cursor,
        });

        const hasMore = posts.length > limit;
        const postsToReturn = hasMore ? posts.slice(0, limit) : posts;

        return {
            posts: postsToReturn.map((post: any) => ({
                id: post.id,
                body: post.body,
                author: {
                    personaId: post.persona.id,
                    displayName: post.persona.displayName,
                    // ❌ NO accountabilityProfileId
                },
                createdAt: post.createdAt.toISOString(),
            })),
            nextCursor: hasMore
                ? postsToReturn[postsToReturn.length - 1].createdAt.toISOString()
                : undefined,
        };
    }

    /**
     * Get user's own posts (across all personas)
     */
    async getUserPosts(params: {
        accountabilityProfileId: string;
        personaId?: string;
        limit?: number;
    }): Promise<{
        posts: Array<{
            id: string;
            body: string;
            personaId: string;
            personaDisplayName: string;
            createdAt: string;
        }>;
    }> {
        const limit = Math.min(params.limit || 20, 100);

        const posts = await this.publicContentRepo.findByAccountabilityProfile(
            params.accountabilityProfileId,
            params.personaId
        );

        return {
            posts: posts.slice(0, limit).map((post: any) => ({
                id: post.id,
                body: post.body,
                personaId: post.persona.id,
                personaDisplayName: post.persona.displayName,
                createdAt: post.createdAt.toISOString(),
            })),
        };
    }

    /**
     * Delete post (soft delete)
     * Verifies ownership before deletion
     */
    async deletePost(data: {
        postId: string;
        accountabilityProfileId: string;
    }): Promise<{
        deletedAt: string;
    }> {
        // 1. Find post
        const post = await this.publicContentRepo.findById(data.postId);
        if (!post) {
            throw new NotFoundException('POST_NOT_FOUND');
        }

        // 2. Verify ownership
        const persona = await this.personaRepo.findById(post.personaId);
        if (!persona || persona.accountabilityProfileId !== data.accountabilityProfileId) {
            throw new ForbiddenException('POST_NOT_OWNED');
        }

        // 3. Soft delete
        const deleted = await this.publicContentRepo.softDelete(data.postId);

        return {
            deletedAt: deleted.deletedAt!.toISOString(),
        };
    }

    /**
     * Check rate limit (policy-driven)
     */
    private async checkRateLimit(
        personaId: string,
        accountabilityProfileId: string
    ): Promise<void> {
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);

        // Get persona's trust level
        const trustLevel = await this.trustLevelRepo.findByPersonaId(personaId);
        const trustLevelValue = trustLevel?.level || 'NEW';

        // Check persona-level limit
        const personaPosts = await this.publicContentRepo.findByAccountabilityProfile(
            accountabilityProfileId,
            personaId
        );
        const recentPersonaPosts = personaPosts.filter(
            p => p.createdAt >= oneHourAgo
        );

        // Check account-wide limit
        const accountPosts = await this.publicContentRepo.findByAccountabilityProfile(
            accountabilityProfileId
        );
        const recentAccountPosts = accountPosts.filter(
            p => p.createdAt >= oneHourAgo
        );

        // Evaluate policy
        const allowed = this.policyEngine.evaluate('post_rate_limit', {
            recentPostCount: recentPersonaPosts.length,
            trustLevel: trustLevelValue,
            accountRecentPostCount: recentAccountPosts.length,
        });

        if (!allowed) {
            throw new ForbiddenException('RATE_LIMIT_EXCEEDED');
        }
    }
}
