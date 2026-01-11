import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Security
import { SecurityModule } from '../security/security.module';

// Policy
import { PolicyModule } from '../policy/policy.module';

// Repositories
import { AuthProfileRepository } from './repositories/auth-profile.repository';
import { AccountabilityProfileRepository } from './repositories/accountability-profile.repository';
import { PersonaRepository } from './repositories/persona.repository';
import { TrustLevelRepository } from './repositories/trust-level.repository';

// Services
import { IdentityService } from './services/identity.service';
import { PersonaService } from './services/persona.service';

// Controllers
import { AuthController } from './controllers/auth.controller';
import { PersonaController } from './controllers/persona.controller';

/**
 * Identity Module
 * 
 * Provides authentication and identity management services
 */
@Module({
    imports: [SecurityModule, PolicyModule],
    providers: [
        // Prisma
        {
            provide: PrismaClient,
            useFactory: () => {
                const prisma = new PrismaClient();
                return prisma;
            },
        },

        // Repositories
        AuthProfileRepository,
        AccountabilityProfileRepository,
        PersonaRepository,
        TrustLevelRepository,

        // Services
        IdentityService,
        PersonaService,
    ],
    controllers: [
        AuthController,
        PersonaController,
    ],
    exports: [
        IdentityService,
        PersonaService,
    ],
})
export class IdentityModule { }
