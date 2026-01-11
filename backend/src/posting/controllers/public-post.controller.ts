import { Controller, Post, Get, Delete, Body, Query, Param, Req, UnauthorizedException } from '@nestjs/common';
import { PostService } from '../services/post.service';
import { Request } from 'express';
import { randomUUID } from 'crypto';

/**
 * Public Post Controller
 * 
 * Handles public posting endpoints
 * Uses session for authentication/authorization
 */
@Controller('public/posts')
export class PublicPostController {
    constructor(private readonly postService: PostService) { }

    @Post()
    async createPost(
        @Req() req: Request,
        @Body() dto: {
            personaId: string;
            body: string;
        }
    ): Promise<{
        postId: string;
        createdAt: string;
        correlationId: string;
    }> {
        const session = (req as any).session;
        if (!session?.accountabilityProfileId) {
            throw new UnauthorizedException();
        }

        const result = await this.postService.createPost({
            personaId: dto.personaId,
            body: dto.body,
            accountabilityProfileId: session.accountabilityProfileId,
        });

        return {
            ...result,
            correlationId: this.generateCorrelationId(),
        };
    }

    @Get()
    async getPublicFeed(
        @Query('limit') limit?: string,
        @Query('cursor') cursor?: string
    ): Promise<{
        posts: Array<{
            id: string;
            body: string;
            author: {
                personaId: string;
                displayName: string;
            };
            createdAt: string;
        }>;
        nextCursor?: string;
        correlationId: string;
    }> {
        const result = await this.postService.getPublicFeed({
            limit: limit ? parseInt(limit, 10) : undefined,
            cursor,
        });

        return {
            ...result,
            correlationId: this.generateCorrelationId(),
        };
    }

    @Delete(':id')
    async deletePost(
        @Param('id') postId: string,
        @Req() req: Request
    ): Promise<{
        deletedAt: string;
        correlationId: string;
    }> {
        const session = (req as any).session;
        if (!session?.accountabilityProfileId) {
            throw new UnauthorizedException();
        }

        const result = await this.postService.deletePost({
            postId,
            accountabilityProfileId: session.accountabilityProfileId,
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
