import { Module } from '@nestjs/common';

// Security & Observability (must be first for middleware)
import { SecurityModule } from './security/security.module';
import { ObservabilityModule } from './observability/observability.module';

// Database
import { PrismaModule } from './prisma/prisma.module';

// Core Modules
import { IdentityModule } from './identity/identity.module';
import { PostingModule } from './posting/posting.module';
import { ModerationModule } from './moderation/moderation.module';
import { PolicyModule } from './policy/policy.module';
import { ReportingModule } from './reporting/reporting.module';
import { CommunitiesModule } from './communities/communities.module';

/**
 * App Module
 * 
 * Root module that wires all services together
 */
@Module({
    imports: [
        // Security & Observability (must be first for middleware)
        SecurityModule,
        ObservabilityModule,

        // Database
        PrismaModule,

        // Core Services
        PolicyModule,
        IdentityModule,
        PostingModule,
        ModerationModule,
        ReportingModule,
        CommunitiesModule, // Phase 1: Community system
    ],
})
export class AppModule { }

