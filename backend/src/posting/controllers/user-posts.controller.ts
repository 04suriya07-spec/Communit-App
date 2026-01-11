import { Controller, Get, Query, Req } from '@nestjs/common';
import { PostService } from '../services/post.service';
import { Request } from 'express';
import { randomUUID } from 'crypto';

/**
 * User Posts Controller
 * 
 * Handles viewing user's own posts
 */
@Controller('users/me/posts')
export class UserPostsController {
    constructor(private readonly postService: PostService) { }

    @Get()
    async getUserPosts(
        @Req() req: Request,
        @Query('personaId') personaId?: string,
        @Query('limit') limit?: string
    ): Promise<{
        posts: Array<{
            id: string;
            body: string;
            personaId: string;
            personaDisplayName: string;
            createdAt: string;
        }>;
        correlationId: string;
    }> {
        const session = (req as any).session;
        if (!session?.accountabilityProfileId) {
            throw new Error('Unauthorized');
        }

        const result = await this.postService.getUserPosts({
            accountabilityProfileId: session.accountabilityProfileId,
            personaId,
            limit: limit ? parseInt(limit, 10) : undefined,
        });

        return {
            ...result,
            correlationId: this.generateCorrelationId(),
        };
    }

    private generateCorrelationId(): string {
        return randomUUID();
    }
}
