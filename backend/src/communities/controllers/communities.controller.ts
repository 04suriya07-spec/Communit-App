import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    Req,
    UseGuards,
    HttpCode,
    HttpStatus,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { CommunitiesService } from '../services/communities.service';
import { CreateCommunityDto } from '../dto/create-community.dto';
import { ListCommunitiesDto } from '../dto/list-communities.dto';
import {
    CommunityResponseDto,
    ListCommunitiesResponseDto,
} from '../dto/community-response.dto';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe';

/**
 * Communities Controller
 * Handles HTTP requests for community management
 * 
 * Phase 1 Endpoints:
 * - POST /communities - Create community
 * - GET /communities - List communities
 * - GET /communities/:id - Get community by ID
 */
@Controller('communities')
export class CommunitiesController {
    constructor(private readonly communitiesService: CommunitiesService) { }

    /**
     * Create a new community
     * Requires authentication
     * Creator is automatically assigned as owner
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body() dto: CreateCommunityDto,
        @Req() req: Request,
    ): Promise<CommunityResponseDto> {
        // Get user ID from session
        const userId = (req as any).session?.accountabilityProfileId;

        if (!userId) {
            throw new UnauthorizedException({
                error: 'UNAUTHORIZED',
                message: 'Authentication required',
            });
        }

        return this.communitiesService.create(dto, userId);
    }

    /**
     * List communities with optional filtering
     * Public endpoint - authentication optional
     * Visibility rules applied based on community type and user membership
     */
    @Get()
    async list(
        @Query() dto: ListCommunitiesDto,
        @Req() req: Request,
    ): Promise<ListCommunitiesResponseDto> {
        // Get user ID from session if authenticated
        const userId = (req as any).session?.accountabilityProfileId;

        return this.communitiesService.list(dto, userId);
    }

    /**
     * Get community by ID
     * Public endpoint - authentication optional
     * Private communities return 404 if user is not a member
     */
    @Get(':id')
    async getById(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: Request,
    ): Promise<CommunityResponseDto> {
        const userId = (req as any).session?.accountabilityProfileId;

        return this.communitiesService.getById(id, userId);
    }

    // ============================================================
    // PHASE 2: Follow System Endpoints
    // ============================================================

    /**
     * Follow a community
     */
    @Post(':id/follow')
    @HttpCode(HttpStatus.NO_CONTENT)
    async follow(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request): Promise<void> {
        const userId = (req as any).session?.accountabilityProfileId;
        if (!userId) {
            throw new UnauthorizedException({ error: 'UNAUTHORIZED', message: 'Authentication required' });
        }

        await this.communitiesService.follow(id, userId);
    }

    /**
     * Unfollow a community
     */
    @Post(':id/unfollow')
    @HttpCode(HttpStatus.NO_CONTENT)
    async unfollow(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request): Promise<void> {
        const userId = (req as any).session?.accountabilityProfileId;
        if (!userId) {
            throw new UnauthorizedException({ error: 'UNAUTHORIZED', message: 'Authentication required' });
        }

        await this.communitiesService.unfollow(id, userId);
    }

    /**
     * Get communities user is following
     */
    @Get('following/me')
    async getFollowing(@Req() req: Request): Promise<CommunityResponseDto[]> {
        const userId = (req as any).session?.accountabilityProfileId;
        if (!userId) {
            throw new UnauthorizedException({ error: 'UNAUTHORIZED', message: 'Authentication required' });
        }

        return this.communitiesService.getFollowing(userId);
    }

    // ============================================================
    // PHASE 2: Join Request Workflow Endpoints
    // ============================================================

    /**
     * Join or request to join a community
     */
    @Post(':id/join')
    async join(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: { message?: string },
        @Req() req: Request,
    ): Promise<{ status: 'joined' | 'requested'; requestId?: string }> {
        const userId = (req as any).session?.accountabilityProfileId;
        if (!userId) {
            throw new UnauthorizedException({ error: 'UNAUTHORIZED', message: 'Authentication required' });
        }

        return this.communitiesService.join(id, userId, body.message);
    }

    /**
     * Leave a community
     */
    @Post(':id/leave')
    @HttpCode(HttpStatus.NO_CONTENT)
    async leave(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request): Promise<void> {
        const userId = (req as any).session?.accountabilityProfileId;
        if (!userId) {
            throw new UnauthorizedException({ error: 'UNAUTHORIZED', message: 'Authentication required' });
        }

        await this.communitiesService.leave(id, userId);
    }

    /**
     * Get join requests for a community (admin/owner only)
     */
    @Get(':id/requests')
    async getJoinRequests(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
        const userId = (req as any).session?.accountabilityProfileId;
        if (!userId) {
            throw new UnauthorizedException({ error: 'UNAUTHORIZED', message: 'Authentication required' });
        }

        return this.communitiesService.getJoinRequests(id, userId);
    }

    /**
     * Approve a join request
     */
    @Post(':id/requests/:requestId/approve')
    @HttpCode(HttpStatus.NO_CONTENT)
    async approveJoinRequest(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('requestId', ParseUUIDPipe) requestId: string,
        @Req() req: Request,
    ): Promise<void> {
        const userId = (req as any).session?.accountabilityProfileId;
        if (!userId) {
            throw new UnauthorizedException({ error: 'UNAUTHORIZED', message: 'Authentication required' });
        }

        await this.communitiesService.approveJoinRequest(id, requestId, userId);
    }

    /**
     * Reject a join request
     */
    @Post(':id/requests/:requestId/reject')
    @HttpCode(HttpStatus.NO_CONTENT)
    async rejectJoinRequest(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('requestId', ParseUUIDPipe) requestId: string,
        @Req() req: Request,
    ): Promise<void> {
        const userId = (req as any).session?.accountabilityProfileId;
        if (!userId) {
            throw new UnauthorizedException({ error: 'UNAUTHORIZED', message: 'Authentication required' });
        }

        await this.communitiesService.rejectJoinRequest(id, requestId, userId);
    }

    // ============================================================
    // PHASE 2: Member Management Endpoints
    // ============================================================

    /**
     * Get all members of a community
     */
    @Get(':id/members')
    async getMembers(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
        const userId = (req as any).session?.accountabilityProfileId;
        return this.communitiesService.getMembers(id, userId);
    }

    /**
     * Change a member's role (owner/admin only)
     */
    @Post(':id/members/:userId/role')
    @HttpCode(HttpStatus.NO_CONTENT)
    async changeMemberRole(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('userId', ParseUUIDPipe) targetUserId: string,
        @Body() body: { role: string },
        @Req() req: Request,
    ): Promise<void> {
        const userId = (req as any).session?.accountabilityProfileId;
        if (!userId) {
            throw new UnauthorizedException({ error: 'UNAUTHORIZED', message: 'Authentication required' });
        }

        await this.communitiesService.changeMemberRole(id, targetUserId, body.role as any, userId);
    }

    /**
     * Remove a member from community (kick)
     */
    @Post(':id/members/:userId/remove')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeMember(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('userId', ParseUUIDPipe) targetUserId: string,
        @Req() req: Request,
    ): Promise<void> {
        const userId = (req as any).session?.accountabilityProfileId;
        if (!userId) {
            throw new UnauthorizedException({ error: 'UNAUTHORIZED', message: 'Authentication required' });
        }

        await this.communitiesService.removeMember(id, targetUserId, userId);
    }

    // ============================================================
    // PHASE 2: Community Management Endpoints
    // ============================================================

    /**
     * Update community settings (owner only)
     */
    @Post(':id/update')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updates: any,
        @Req() req: Request,
    ): Promise<CommunityResponseDto> {
        const userId = (req as any).session?.accountabilityProfileId;
        if (!userId) {
            throw new UnauthorizedException({ error: 'UNAUTHORIZED', message: 'Authentication required' });
        }

        return this.communitiesService.update(id, userId, updates);
    }

    /**
     * Delete community (soft delete, owner only)
     */
    @Post(':id/delete')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request): Promise<void> {
        const userId = (req as any).session?.accountabilityProfileId;
        if (!userId) {
            throw new UnauthorizedException({ error: 'UNAUTHORIZED', message: 'Authentication required' });
        }

        await this.communitiesService.delete(id, userId);
    }
}


