import { CommunityMember, MemberRole } from '@prisma/client';

export interface ICommunityMemberRepository {
    /**
     * Add a member to a community
     */
    create(data: {
        communityId: string;
        userId: string;
        role: MemberRole;
        invitedBy?: string;
    }): Promise<CommunityMember>;

    /**
     * Find member by community and user
     */
    findByCommunityAndUser(
        communityId: string,
        userId: string,
    ): Promise<CommunityMember | null>;

    /**
     * Get all members of a community
     */
    findByCommunity(communityId: string): Promise<CommunityMember[]>;

    /**
     * Get user's role in a community
     */
    getUserRole(communityId: string, userId: string): Promise<MemberRole | null>;

    /**
     * Update member role
     */
    updateRole(
        communityId: string,
        userId: string,
        role: MemberRole,
    ): Promise<CommunityMember>;

    /**
     * Remove member from community
     */
    remove(communityId: string, userId: string): Promise<void>;

    /**
     * Check if user is member
     */
    isMember(communityId: string, userId: string): Promise<boolean>;
}
