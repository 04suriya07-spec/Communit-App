import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Policy
import { PolicyModule } from '../policy/policy.module';

// Repositories
import { PublicContentRepository } from './repositories/public-content.repository';
import { PersonaRepository } from '../identity/repositories/persona.repository';
import { TrustLevelRepository } from '../identity/repositories/trust-level.repository';

// Services
import { PostService } from './services/post.service';

// Controllers
import { PublicPostController } from './controllers/public-post.controller';
import { UserPostsController } from './controllers/user-posts.controller';

/**
 * Posting Module
 * 
 * Provides public posting services
 */
@Module({
    imports: [PolicyModule],
    providers: [
        // Prisma (shared instance)
        {
            provide: PrismaClient,
            useFactory: () => {
                return new PrismaClient();
            },
        },

        // Repositories
        PublicContentRepository,
        PersonaRepository, // Imported from Identity module
        TrustLevelRepository, // Imported from Identity module

        // Services
        PostService,
    ],
    controllers: [
        PublicPostController,
        UserPostsController,
    ],
    exports: [
        PostService,
    ],
})
export class PostingModule { }
