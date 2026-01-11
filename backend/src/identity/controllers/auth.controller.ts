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
        },
        @Req() req: Request
    ): Promise<{
        personaId: string;
        displayName: string;
        correlationId: string;
    }> {
        console.log('Register request received:', dto.email);
        const result = await this.identityService.register({
            email: dto.email,
            password: dto.password,
            initialDisplayName: dto.initialDisplayName,
        });
        console.log('Identity registration successful:', result.personaId);

        // Store internal session data (NOT returned to client)
        const session = (req as any).session;
        session.personaId = result.personaId;
        session.accountabilityProfileId = result._internal.accountabilityProfileId;
        session.trustLevel = result._internal.trustLevel;
        session.riskLevel = result._internal.riskLevel;

        console.log('Session properties updated');

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
