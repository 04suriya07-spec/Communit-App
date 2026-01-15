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

        // CRITICAL: Explicitly save session to ensure persistence
        await new Promise<void>((resolve, reject) => {
            session.save((err: any) => {
                if (err) {
                    console.error('Session save error:', err);
                    reject(err);
                } else {
                    console.log('Session saved successfully');
                    resolve();
                }
            });
        });

        console.log('Session properties updated and saved');

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
        console.log('Login request received:', dto.email);
        const result = await this.identityService.login({
            email: dto.email,
            password: dto.password,
        });
        console.log('Login successful:', result.personaId);

        // Store internal session data (NOT returned to client)
        const session = (req as any).session;
        session.personaId = result.personaId;
        session.accountabilityProfileId = result._internal.accountabilityProfileId;
        session.trustLevel = result._internal.trustLevel;
        session.riskLevel = result._internal.riskLevel;

        // CRITICAL: Explicitly save session to ensure persistence
        await new Promise<void>((resolve, reject) => {
            session.save((err: any) => {
                if (err) {
                    console.error('Session save error:', err);
                    reject(err);
                } else {
                    console.log('Session saved successfully');
                    resolve();
                }
            });
        });

        console.log('Session properties updated and saved');

        // Return public data only
        return {
            personaId: result.personaId,
            displayName: result.displayName,
            correlationId: this.generateCorrelationId(),
        };
    }

    @Post('logout')
    async logout(@Req() req: Request): Promise<{ message: string }> {
        const session = (req as any).session;

        return new Promise((resolve, reject) => {
            session.destroy((err: any) => {
                if (err) {
                    console.error('Logout error:', err);
                    reject(err);
                } else {
                    console.log('Session destroyed successfully');
                    resolve({ message: 'Logged out successfully' });
                }
            });
        });
    }

    private generateCorrelationId(): string {
        return randomUUID();
    }
}
