import { Community, CommunityType } from '@prisma/client';

export interface ListCommunitiesOptions {
    type?: CommunityType;
    search?: string;
    limit?: number;
    cursor?: string;
    userId?: string; // For filtering based on membership/visibility
}

export interface ICommunityRepository {
    /**
     * Create a new community
     */
    create(data: {
        slug: string;
        name: string;
        description?: string;
        type: CommunityType;
        creatorId: string;
        avatarUrl?: string;
        bannerUrl?: string;
    }): Promise<Community>;

    /**
     * Find community by ID
     */
    findById(id: string): Promise<Community | null>;

    /**
     * Find community by slug
     */
    findBySlug(slug: string): Promise<Community | null>;

    /**
     * List communities with filtering and pagination
     */
    list(options: ListCommunitiesOptions): Promise<{
        communities: Community[];
        total: number;
        hasMore: boolean;
    }>;

    /**
     * Update community
     */
    update(id: string, data: Partial<Community>): Promise<Community>;

    /**
     * Soft delete community
     */
    delete(id: string): Promise<void>;

    /**
     * Increment member count
     */
    incrementMemberCount(id: string): Promise<void>;

    /**
     * Decrement member count
     */
    decrementMemberCount(id: string): Promise<void>;

    /**
     * Increment follower count
     */
    incrementFollowerCount(id: string): Promise<void>;

    /**
     * Decrement follower count
     */
    decrementFollowerCount(id: string): Promise<void>;
}
