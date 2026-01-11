import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Repositories
import { ModerationSignalRepository } from './repositories/moderation-signal.repository';
import { PublicContentRepository } from '../posting/repositories/public-content.repository';
import { PersonaRepository } from '../identity/repositories/persona.repository';

// Services
import { ReportingService } from './services/reporting.service';

// Controllers
import { UserReportController } from './controllers/user-report.controller';
import { AdminReportController } from './controllers/admin-report.controller';

// Guards
import { AdminAuthGuard } from '../moderation/guards/admin-auth.guard';

/**
 * Reporting Module
 * 
 * Provides user reporting and moderation signals
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
        ModerationSignalRepository,
        PublicContentRepository,
        PersonaRepository,

        // Services
        ReportingService,

        // Guards
        AdminAuthGuard,
    ],
    controllers: [
        UserReportController,
        AdminReportController,
    ],
    exports: [
        ReportingService,
        ModerationSignalRepository,
    ],
})
export class ReportingModule { }
