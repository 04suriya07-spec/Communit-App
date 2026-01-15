import {
    Injectable,
    BadRequestException,
    NotFoundException,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { CommunityRepository } from '../repositories/community.repository';
import { CommunityMemberRepository } from '../repositories/community-member.repository';
import { CreateCommunityDto } from '../dto/create-community.dto';
import { ListCommunitiesDto } from '../dto/list-communities.dto';
import {
    CommunityResponseDto,
    ListCommunitiesResponseDto,
} from '../dto/community-response.dto';
import { Community, CommunityType, MemberRole } from '@prisma/client';

@Injectable()
export class CommunitiesService {
    constructor(
        private readonly communityRepo: CommunityRepository,
        private readonly memberRepo: CommunityMemberRepository,
    ) { }

    /**
     * Create a new community
     * Creator is automatically assigned as owner
     */
    async create(
        dto: CreateCommunityDto,
        creatorId: string,
    ): Promise<CommunityResponseDto> {
        // Generate slug from name if not provided
        const slug = dto.slug || this.generateSlug(dto.name);

        // Check if slug is already taken
        const existing = await this.communityRepo.findBySlug(slug);
        if (existing) {
            throw new ConflictException('Community slug already exists');
        }

        // Create community
        const community = await this.communityRepo.create({
            slug,
            name: dto.name,
            description: dto.description,
            type: dto.type,
            creatorId,
            avatarUrl: dto.avatarUrl,
            bannerUrl: dto.bannerUrl,
        });

        // Add creator as owner
        await this.memberRepo.create({
            communityId: community.id,
            userId: creatorId,
            role: MemberRole.owner,
        });

        return CommunityResponseDto.fromEntity(community, MemberRole.owner, false);
    }

    /**
     * List communities with visibility filtering
     */
    async list(
        dto: ListCommunitiesDto,
        userId?: string,
    ): Promise<ListCommunitiesResponseDto> {
        const result = await this.communityRepo.list({
            type: dto.type,
            search: dto.search,
            limit: dto.limit,
            cursor: dto.cursor,
            userId,
        });

        // Filter communities based on visibility rules
        const visibleCommunities = await this.filterByVisibility(
            result.communities,
            userId,
        );

        // Enrich with user context (role, following status)
        const enrichedCommunities = await Promise.all(
            visibleCommunities.map((community) =>
                this.enrichWithUserContext(community, userId),
            ),
        );

        return {
            communities: enrichedCommunities,
            pagination: {
                total: result.total,
                limit: dto.limit || 20,
                cursor: result.hasMore
                    ? visibleCommunities[visibleCommunities.length - 1]?.id || null
                    : null,
                hasMore: result.hasMore,
            },
        };
    }

    /**
     * Get community by ID with visibility check
     */
    async getById(id: string, userId?: string): Promise<CommunityResponseDto> {
        const community = await this.communityRepo.findById(id);

        if (!community) {
            throw new NotFoundException('Community not found');
        }

        // Check visibility
        const canView = await this.canViewCommunity(community, userId);
        if (!canView) {
            throw new NotFoundException('Community not found'); // Don't reveal existence
        }

        return this.enrichWithUserContext(community, userId);
    }

    /**
     * Get community by slug with visibility check
     */
    async getBySlug(slug: string, userId?: string): Promise<CommunityResponseDto> {
        const community = await this.communityRepo.findBySlug(slug);

        if (!community) {
            throw new NotFoundException('Community not found');
        }

        const canView = await this.canViewCommunity(community, userId);
        if (!canView) {
            throw new NotFoundException('Community not found');
        }

        return this.enrichWithUserContext(community, userId);
    }

    // ============================================================
    // HELPER METHODS
    // ============================================================

    /**
     * Generate URL-friendly slug from name
     */
    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .substring(0, 50); // Limit length
    }

    /**
     * Filter communities based on visibility rules
     */
    private async filterByVisibility(
        communities: Community[],
        userId?: string,
    ): Promise<Community[]> {
        const filtered: Community[] = [];

        for (const community of communities) {
            const canView = await this.canViewCommunity(community, userId);
            if (canView) {
                filtered.push(community);
            }
        }

        return filtered;
    }

    /**
     * Check if user can view a community based on type and membership
     */
    private async canViewCommunity(
        community: Community,
        userId?: string,
    ): Promise<boolean> {
        switch (community.type) {
            case CommunityType.public_open:
                // Anyone can view
                return true;

            case CommunityType.public_restricted:
                // Anyone can view, but joining requires approval
                return true;

            case CommunityType.private:
                // Only members can view
                if (!userId) return false;
                return await this.memberRepo.isMember(community.id, userId);

            default:
                return false;
        }
    }

    /**
     * Enrich community with user-specific context
     */
    private async enrichWithUserContext(
        community: Community,
        userId?: string,
    ): Promise<CommunityResponseDto> {
        let userRole: MemberRole | undefined;
        let isFollowing = false;

        if (userId) {
            userRole = (await this.memberRepo.getUserRole(community.id, userId)) || undefined;
            // TODO Phase 2: Check if user is following
            // isFollowing = await this.followRepo.isFollowing(userId, community.id);
        }

        return CommunityResponseDto.fromEntity(community, userRole, isFollowing);
    }

    // ============================================================
    // TODO PHASE 2: Additional methods
    // ============================================================

    // TODO Phase 2: Update community (owner only)
    // TODO Phase 2: Delete community (owner only)
    // TODO Phase 2: Follow/unfollow community
    // TODO Phase 2: Join community (with request for restricted/private)
    // TODO Phase 2: Leave community
    // TODO Phase 2: Manage members (add, remove, change role)
    // TODO Phase 2: Approve/reject join requests
}
