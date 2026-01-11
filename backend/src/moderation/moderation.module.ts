import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Repositories
import { ModerationLogRepository } from './repositories/moderation-log.repository';
import { InternalAdminRepository } from './repositories/internal-admin.repository';
import { AccountabilityProfileRepository } from '../identity/repositories/accountability-profile.repository';
import { PersonaRepository } from '../identity/repositories/persona.repository';
import { TrustLevelRepository } from '../identity/repositories/trust-level.repository';
import { PublicContentRepository } from '../posting/repositories/public-content.repository';

// Services
import { ModerationService } from './services/moderation.service';
import { AdminService } from './services/admin.service';

// Controllers
import { AccountabilityController } from './controllers/accountability.controller';
import { ModerationQueueController } from './controllers/moderation-queue.controller';
import { AdminController } from './controllers/admin.controller';

// Guards
import { AdminAuthGuard } from './guards/admin-auth.guard';

/**
 * Moderation Module
 * 
 * Internal-only Trust & Safety tools
 */
@Module({
    providers: [
        // Prisma (shared instance)
        {
            provide: PrismaClient,
            useFactory: () => {
                return new PrismaClient();
            },
        },

        // Repositories
        ModerationLogRepository,
        InternalAdminRepository,
        AccountabilityProfileRepository,
        PersonaRepository,
        TrustLevelRepository,
        PublicContentRepository,

        // Services
        ModerationService,
        AdminService,

        // Guards
        AdminAuthGuard,
    ],
    controllers: [
        AccountabilityController,
        ModerationQueueController,
        AdminController,
    ],
    exports: [
        ModerationService,
        AdminService,
    ],
})
export class ModerationModule { }
