import { Follow } from '@prisma/client';

export interface IFollowRepository {
    /**
     * Create a follow relationship
     */
    create(userId: string, communityId: string): Promise<Follow>;

    /**
     * Delete a follow relationship
     */
    delete(userId: string, communityId: string): Promise<void>;

    /**
     * Find follow by user and community
     */
    findByUserAndCommunity(userId: string, communityId: string): Promise<Follow | null>;

    /**
     * Find all communities a user follows
     */
    findByUser(userId: string): Promise<Follow[]>;

    /**
     * Find all followers of a community
     */
    findByCommunity(communityId: string): Promise<Follow[]>;

    /**
     * Check if user is following a community
     */
    isFollowing(userId: string, communityId: string): Promise<boolean>;
}
