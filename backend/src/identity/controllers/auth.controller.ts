import { Controller, Post, Body, Req } from '@nestjs/common';
import { IdentityService } from '../services/identity.service';
import { Request } from 'express';
import { randomUUID } from 'crypto';

/**
 * Auth Controller
 * 
 * Handles registration and login endpoints
 * Returns only public data, stores internal data in session
 */
@Controller('auth')
export class AuthController {
    constructor(private readonly identityService: IdentityService) { }

    @Post('register')
    async register(
        @Body() dto: {
            email: string;
            password: string;
            initialDisplayName: string;
        }
    ): Promise<{
        personaId: string;
        displayName: string;
        correlationId: string;
    }> {
        const result = await this.identityService.register({
            email: dto.email,
            password: dto.password,
            initialDisplayName: dto.initialDisplayName,
        });

        return {
            personaId: result.personaId,
            displayName: result.displayName,
            correlationId: this.generateCorrelationId(),
        };
    }

    @Post('login')
    async login(
        @Body() dto: {
            email: string;
            password: string;
        },
        @Req() req: Request
    ): Promise<{
        personaId: string;
        displayName: string;
        correlationId: string;
    }> {
        const result = await this.identityService.login({
            email: dto.email,
            password: dto.password,
        });

        // Store internal session data (NOT returned to client)
        (req as any).session = {
            personaId: result.personaId,
            accountabilityProfileId: result._internal.accountabilityProfileId,
            trustLevel: result._internal.trustLevel,
            riskLevel: result._internal.riskLevel,
        };

        // Return public data only
        return {
            personaId: result.personaId,
            displayName: result.displayName,
            correlationId: this.generateCorrelationId(),
        };
    }

    private generateCorrelationId(): string {
        return randomUUID();
    }
}
