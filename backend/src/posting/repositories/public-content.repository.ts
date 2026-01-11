import { Injectable } from '@nestjs/common';
import { PrismaClient, PublicContent, ModerationStatus } from '@prisma/client';
import { IPublicContentRepository } from './public-content.repository.interface';

/**
 * PublicContent Repository Implementation
 * 
 * Phase 1: All posts auto-approved, no moderation
 */
@Injectable()
export class PublicContentRepository implements IPublicContentRepository {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * Create new post
     * Phase 1: Auto-approve all posts (moderation_status = APPROVED)
     */
    async create(data: {
        personaId: string;
        body: string;
    }): Promise<PublicContent> {
        return this.prisma.publicContent.create({
            data: {
                personaId: data.personaId,
                body: data.body,
                isModerated: false,
                moderationStatus: ModerationStatus.APPROVED,
            },
        });
    }

    /**
     * Find post by ID
     */
    async findById(id: string): Promise<PublicContent | null> {
        return this.prisma.publicContent.findUnique({
            where: { id },
        });
    }

    /**
     * Get public feed (non-deleted posts only)
     * Ordered by created_at DESC for chronological feed
     */
    async findPublicFeed(params: {
        limit: number;
        cursor?: Date;
    }): Promise<PublicContent[]> {
        return this.prisma.publicContent.findMany({
            where: {
                deletedAt: null,
                ...(params.cursor && {
                    createdAt: {
                        lt: params.cursor,
                    },
                }),
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: params.limit,
            include: {
                persona: {
                    select: {
                        id: true,
                        displayName: true,
                        // ❌ NO accountabilityProfileId
                    },
                },
            },
        });
    }

    /**
     * Get posts by accountability profile (my posts)
     * Joins through persona to filter by accountability
     */
    async findByAccountabilityProfile(
        accountabilityProfileId: string,
        personaId?: string
    ): Promise<PublicContent[]> {
        return this.prisma.publicContent.findMany({
            where: {
                deletedAt: null,
                persona: {
                    accountabilityProfileId,
                    ...(personaId && { id: personaId }),
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                persona: {
                    select: {
                        id: true,
                        displayName: true,
                    },
                },
            },
        });
    }

    /**
     * Soft delete post (sets deleted_at = now())
     * Hard delete happens after retention period
     */
    async softDelete(id: string): Promise<PublicContent> {
        return this.prisma.publicContent.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
