import { Community, CommunityType, MemberRole } from '@prisma/client';

export class CommunityResponseDto {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    type: CommunityType;
    avatarUrl: string | null;
    bannerUrl: string | null;
    memberCount: number;
    followerCount: number;
    createdAt: Date;
    updatedAt: Date;

    // Conditional fields based on user context
    userRole?: MemberRole;
    isFollowing?: boolean;
    isMember?: boolean;

    static fromEntity(
        community: Community,
        userRole?: MemberRole,
        isFollowing?: boolean,
    ): CommunityResponseDto {
        return {
            id: community.id,
            slug: community.slug,
            name: community.name,
            description: community.description,
            type: community.type,
            avatarUrl: community.avatarUrl,
            bannerUrl: community.bannerUrl,
            memberCount: community.memberCount,
            followerCount: community.followerCount,
            createdAt: community.createdAt,
            updatedAt: community.updatedAt,
            userRole,
            isFollowing,
            isMember: userRole !== undefined,
        };
    }
}

export class ListCommunitiesResponseDto {
    communities: CommunityResponseDto[];
    pagination: {
        total: number;
        limit: number;
        cursor: string | null;
        hasMore: boolean;
    };
}
