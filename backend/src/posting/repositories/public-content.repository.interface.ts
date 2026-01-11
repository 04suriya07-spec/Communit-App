import { PublicContent } from '@prisma/client';

/**
 * PublicContent Repository Interface
 * 
 * Handles public posts with persona authorship
 */
export interface IPublicContentRepository {
    /**
     * Create new post
     */
    create(data: {
        personaId: string;
        body: string;
    }): Promise<PublicContent>;

    /**
     * Find post by ID
     */
    findById(id: string): Promise<PublicContent | null>;

    /**
     * Get public feed (non-deleted posts only)
     */
    findPublicFeed(params: {
        limit: number;
        cursor?: Date;
    }): Promise<PublicContent[]>;

    /**
     * Get posts by accountability profile (for "my posts" view)
     * Optionally filter by specific persona
     */
    findByAccountabilityProfile(
        accountabilityProfileId: string,
        personaId?: string
    ): Promise<PublicContent[]>;

    /**
     * Soft delete post (sets deleted_at)
     */
    softDelete(id: string): Promise<PublicContent>;
}
