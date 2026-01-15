import { Module } from '@nestjs/common';
import { CommunitiesController } from './controllers/communities.controller';
import { CommunitiesService } from './services/communities.service';
import { CommunityRepository } from './repositories/community.repository';
import { CommunityMemberRepository } from './repositories/community-member.repository';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Communities Module
 * 
 * Provides community management functionality including:
 * - Community CRUD operations
 * - Membership management
 * - Visibility and permission controls
 * - Follow system (Phase 2)
 * - Join request workflows (Phase 2)
 * 
 * Phase 1: Core community creation, listing, and retrieval
 * Phase 2: Follow, join, member management
 * Phase 3: Advanced features (invites, moderation integration)
 */
@Module({
    imports: [PrismaModule],
    controllers: [CommunitiesController],
    providers: [
        CommunitiesService,
        CommunityRepository,
        CommunityMemberRepository,
    ],
    exports: [
        CommunitiesService,
        CommunityRepository,
        CommunityMemberRepository,
    ],
})
export class CommunitiesModule { }
