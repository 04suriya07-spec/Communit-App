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
} from '@nestjs/common';
import { Request } from 'express';
import { CommunitiesService } from '../services/communities.service';
import { CreateCommunityDto } from '../dto/create-community.dto';
import { ListCommunitiesDto } from '../dto/list-communities.dto';
import {
    CommunityResponseDto,
    ListCommunitiesResponseDto,
} from '../dto/community-response.dto';

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
            throw new Error('Authentication required'); // Will be handled by auth guard in Phase 2
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
        @Param('id') id: string,
        @Req() req: Request,
    ): Promise<CommunityResponseDto> {
        const userId = (req as any).session?.accountabilityProfileId;

        return this.communitiesService.getById(id, userId);
    }

    // ============================================================
    // TODO PHASE 2: Additional endpoints
    // ============================================================

    // TODO Phase 2: PUT /communities/:id - Update community (owner only)
    // TODO Phase 2: DELETE /communities/:id - Delete community (owner only)
    // TODO Phase 2: POST /communities/:id/follow - Follow community
    // TODO Phase 2: DELETE /communities/:id/follow - Unfollow community
    // TODO Phase 2: POST /communities/:id/join - Join/request to join community
    // TODO Phase 2: POST /communities/:id/leave - Leave community
    // TODO Phase 2: GET /communities/:id/members - Get community members
    // TODO Phase 2: POST /communities/:id/members/:userId/role - Change member role
    // TODO Phase 2: GET /communities/:id/requests - Get join requests (admin/owner)
    // TODO Phase 2: POST /communities/:id/requests/:requestId/approve - Approve join request
    // TODO Phase 2: POST /communities/:id/requests/:requestId/reject - Reject join request
}
