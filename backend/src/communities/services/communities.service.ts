import {
    Injectable,
    BadRequestException,
    NotFoundException,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { CommunityRepository } from '../repositories/community.repository';
import { CommunityMemberRepository } from '../repositories/community-member.repository';
import { FollowRepository } from '../repositories/follow.repository';
import { JoinRequestRepository } from '../repositories/join-request.repository';
import { CreateCommunityDto } from '../dto/create-community.dto';
import { ListCommunitiesDto } from '../dto/list-communities.dto';
import {
    CommunityResponseDto,
    ListCommunitiesResponseDto,
} from '../dto/community-response.dto';
import { Community, CommunityType, MemberRole, JoinRequest, CommunityMember, RequestStatus } from '@prisma/client';

@Injectable()
export class CommunitiesService {
    constructor(
        private readonly communityRepo: CommunityRepository,
        private readonly memberRepo: CommunityMemberRepository,
        private readonly followRepo: FollowRepository,
        private readonly joinRequestRepo: JoinRequestRepository,
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
            isFollowing = await this.followRepo.isFollowing(userId, community.id);
        }

        return CommunityResponseDto.fromEntity(community, userRole, isFollowing);
    }

    // ============================================================
    // PHASE 2: Follow System
    // ============================================================

    /**
     * Follow a community
     */
    async follow(communityId: string, userId: string): Promise<void> {
        const community = await this.communityRepo.findById(communityId);
        if (!community) {
            throw new NotFoundException('Community not found');
        }

        // Check if already following
        const existing = await this.followRepo.findByUserAndCommunity(userId, communityId);
        if (existing) {
            return; // Idempotent - already following
        }

        // Create follow relationship
        await this.followRepo.create(userId, communityId);

        // Increment follower count
        await this.communityRepo.incrementFollowerCount(communityId);
    }

    /**
     * Unfollow a community
     */
    async unfollow(communityId: string, userId: string): Promise<void> {
        const existing = await this.followRepo.findByUserAndCommunity(userId, communityId);
        if (!existing) {
            return; // Idempotent - not following
        }

        // Delete follow relationship
        await this.followRepo.delete(userId, communityId);

        // Decrement follower count
        await this.communityRepo.decrementFollowerCount(communityId);
    }

    /**
     * Get communities user is following
     */
    async getFollowing(userId: string): Promise<CommunityResponseDto[]> {
        const follows = await this.followRepo.findByUser(userId);

        return Promise.all(
            follows.map(async (follow: any) => {
                const userRole = await this.memberRepo.getUserRole(follow.communityId, userId);
                return CommunityResponseDto.fromEntity(
                    follow.community,
                    userRole || undefined,
                    true, // isFollowing = true
                );
            }),
        );
    }

    // ============================================================
    // PHASE 2: Join Request Workflow
    // ============================================================

    /**
     * Join or request to join a community
     */
    async join(communityId: string, userId: string, message?: string): Promise<{
        status: 'joined' | 'requested';
        requestId?: string;
    }> {
        const community = await this.communityRepo.findById(communityId);
        if (!community) {
            throw new NotFoundException('Community not found');
        }

        // Check if already a member
        const isMember = await this.memberRepo.isMember(communityId, userId);
        if (isMember) {
            return { status: 'joined' }; // Already a member
        }

        // Check for pending request
        const pendingRequest = await this.joinRequestRepo.findPendingRequest(userId, communityId);
        if (pendingRequest) {
            return { status: 'requested', requestId: pendingRequest.id };
        }

        switch (community.type) {
            case CommunityType.public_open:
                // Auto-join
                await this.memberRepo.create({
                    communityId,
                    userId,
                    role: MemberRole.member,
                });
                await this.communityRepo.incrementMemberCount(communityId);
                return { status: 'joined' };

            case CommunityType.public_restricted:
            case CommunityType.private:
                // Create join request
                const request = await this.joinRequestRepo.create({
                    communityId,
                    userId,
                    message,
                });
                return { status: 'requested', requestId: request.id };

            default:
                throw new BadRequestException('Invalid community type');
        }
    }

    /**
     * Leave a community
     */
    async leave(communityId: string, userId: string): Promise<void> {
        const community = await this.communityRepo.findById(communityId);
        if (!community) {
            throw new NotFoundException('Community not found');
        }

        const userRole = await this.memberRepo.getUserRole(communityId, userId);
        if (!userRole) {
            return; // Not a member
        }

        // Prevent owner from leaving
        if (userRole === MemberRole.owner) {
            throw new ForbiddenException('Owner cannot leave community. Transfer ownership first.');
        }

        // Remove member
        await this.memberRepo.remove(communityId, userId);
        await this.communityRepo.decrementMemberCount(communityId);
    }

    /**
     * Get join requests for a community (admin/owner only)
     */
    async getJoinRequests(communityId: string, userId: string): Promise<JoinRequest[]> {
        const userRole = await this.memberRepo.getUserRole(communityId, userId);
        if (!userRole || (userRole !== MemberRole.owner && userRole !== MemberRole.admin)) {
            throw new ForbiddenException('Only admins and owners can view join requests');
        }

        return this.joinRequestRepo.findByCommunity(communityId, RequestStatus.pending);
    }

    /**
     * Approve a join request
     */
    async approveJoinRequest(
        communityId: string,
        requestId: string,
        reviewerId: string,
    ): Promise<void> {
        const userRole = await this.memberRepo.getUserRole(communityId, reviewerId);
        if (!userRole || (userRole !== MemberRole.owner && userRole !== MemberRole.admin)) {
            throw new ForbiddenException('Only admins and owners can approve requests');
        }

        const request = await this.joinRequestRepo.findById(requestId);
        if (!request || request.communityId !== communityId) {
            throw new NotFoundException('Join request not found');
        }

        if (request.status !== RequestStatus.pending) {
            throw new BadRequestException('Request already processed');
        }

        // Approve request
        await this.joinRequestRepo.approve(requestId, reviewerId);

        // Add user as member
        await this.memberRepo.create({
            communityId,
            userId: request.userId,
            role: MemberRole.member,
        });

        await this.communityRepo.incrementMemberCount(communityId);
    }

    /**
     * Reject a join request
     */
    async rejectJoinRequest(
        communityId: string,
        requestId: string,
        reviewerId: string,
    ): Promise<void> {
        const userRole = await this.memberRepo.getUserRole(communityId, reviewerId);
        if (!userRole || (userRole !== MemberRole.owner && userRole !== MemberRole.admin)) {
            throw new ForbiddenException('Only admins and owners can reject requests');
        }

        const request = await this.joinRequestRepo.findById(requestId);
        if (!request || request.communityId !== communityId) {
            throw new NotFoundException('Join request not found');
        }

        if (request.status !== RequestStatus.pending) {
            throw new BadRequestException('Request already processed');
        }

        await this.joinRequestRepo.reject(requestId, reviewerId);
    }

    // ============================================================
    // PHASE 2: Member Management
    // ============================================================

    /**
     * Get all members of a community
     */
    async getMembers(communityId: string, userId?: string): Promise<CommunityMember[]> {
        const community = await this.communityRepo.findById(communityId);
        if (!community) {
            throw new NotFoundException('Community not found');
        }

        // Check visibility
        const canView = await this.canViewCommunity(community, userId);
        if (!canView) {
            throw new NotFoundException('Community not found');
        }

        return this.memberRepo.findByCommunity(communityId);
    }

    /**
     * Change a member's role (owner/admin only)
     */
    async changeMemberRole(
        communityId: string,
        targetUserId: string,
        newRole: MemberRole,
        requesterId: string,
    ): Promise<void> {
        const requesterRole = await this.memberRepo.getUserRole(communityId, requesterId);
        if (!requesterRole) {
            throw new ForbiddenException('You are not a member of this community');
        }

        const targetRole = await this.memberRepo.getUserRole(communityId, targetUserId);
        if (!targetRole) {
            throw new NotFoundException('Target user is not a member');
        }

        // Role hierarchy check
        const roleHierarchy = {
            [MemberRole.owner]: 6,
            [MemberRole.admin]: 5,
            [MemberRole.moderator]: 4,
            [MemberRole.member]: 3,
            [MemberRole.follower]: 2,
            [MemberRole.guest]: 1,
        };

        // Only owner and admin can change roles
        if (requesterRole !== MemberRole.owner && requesterRole !== MemberRole.admin) {
            throw new ForbiddenException('Only owners and admins can change roles');
        }

        // Cannot promote above own level
        if (roleHierarchy[newRole] >= roleHierarchy[requesterRole]) {
            throw new ForbiddenException('Cannot promote to or above your own role');
        }

        // Cannot demote owner
        if (targetRole === MemberRole.owner) {
            throw new ForbiddenException('Cannot change owner role. Use transfer ownership instead.');
        }

        // Admin cannot change another admin's role (only owner can)
        if (requesterRole === MemberRole.admin && targetRole === MemberRole.admin) {
            throw new ForbiddenException('Only owner can change admin roles');
        }

        await this.memberRepo.updateRole(communityId, targetUserId, newRole);
    }

    /**
     * Remove a member from community (kick)
     */
    async removeMember(
        communityId: string,
        targetUserId: string,
        requesterId: string,
    ): Promise<void> {
        const requesterRole = await this.memberRepo.getUserRole(communityId, requesterId);
        if (!requesterRole) {
            throw new ForbiddenException('You are not a member of this community');
        }

        const targetRole = await this.memberRepo.getUserRole(communityId, targetUserId);
        if (!targetRole) {
            return; // Already not a member
        }

        // Only owner and admin can remove members
        if (requesterRole !== MemberRole.owner && requesterRole !== MemberRole.admin) {
            throw new ForbiddenException('Only owners and admins can remove members');
        }

        // Cannot remove owner
        if (targetRole === MemberRole.owner) {
            throw new ForbiddenException('Cannot remove owner');
        }

        // Admin cannot remove another admin
        if (requesterRole === MemberRole.admin && targetRole === MemberRole.admin) {
            throw new ForbiddenException('Admins cannot remove other admins');
        }

        await this.memberRepo.remove(communityId, targetUserId);
        await this.communityRepo.decrementMemberCount(communityId);
    }

    // ============================================================
    // PHASE 2: Community Management
    // ============================================================

    /**
     * Update community settings (owner only)
     */
    async update(
        communityId: string,
        userId: string,
        updates: Partial<{
            name: string;
            description: string;
            avatarUrl: string;
            bannerUrl: string;
            type: CommunityType;
        }>,
    ): Promise<CommunityResponseDto> {
        const userRole = await this.memberRepo.getUserRole(communityId, userId);
        if (userRole !== MemberRole.owner) {
            throw new ForbiddenException('Only owner can update community settings');
        }

        const community = await this.communityRepo.findById(communityId);
        if (!community) {
            throw new NotFoundException('Community not found');
        }

        // If changing name, regenerate slug
        if (updates.name && updates.name !== community.name) {
            const newSlug = this.generateSlug(updates.name);
            const existing = await this.communityRepo.findBySlug(newSlug);
            if (existing && existing.id !== communityId) {
                throw new ConflictException('Community with this name already exists');
            }
            updates['slug'] = newSlug;
        }

        const updated = await this.communityRepo.update(communityId, updates);
        return this.enrichWithUserContext(updated, userId);
    }

    /**
     * Delete community (soft delete, owner only)
     */
    async delete(communityId: string, userId: string): Promise<void> {
        const userRole = await this.memberRepo.getUserRole(communityId, userId);
        if (userRole !== MemberRole.owner) {
            throw new ForbiddenException('Only owner can delete community');
        }

        await this.communityRepo.delete(communityId);
    }
}

