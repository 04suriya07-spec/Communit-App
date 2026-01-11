import { Controller, Get, Post, Body, Param, Req, UnauthorizedException } from '@nestjs/common';
import { PersonaService } from '../services/persona.service';
import { Request } from 'express';
import { randomUUID } from 'crypto';

/**
 * Persona Controller
 * 
 * Handles persona management: list, create, rotate
 * Uses session data for accountability context
 */
@Controller('personas')
export class PersonaController {
    constructor(private readonly personaService: PersonaService) { }

    @Get()
    async listPersonas(@Req() req: Request): Promise<{
        personas: Array<{
            id: string;
            displayName: string;
            avatarUrl?: string;
            trustLevel: 'NEW' | 'REGULAR' | 'TRUSTED';
            createdAt: string;
        }>;
        correlationId: string;
    }> {
        const session = (req as any).session;
        if (!session?.accountabilityProfileId) {
            throw new UnauthorizedException();
        }

        const personas = await this.personaService.getActivePersonas(
            session.accountabilityProfileId
        );

        return {
            personas,
            correlationId: this.generateCorrelationId(),
        };
    }

    @Post()
    async createPersona(
        @Req() req: Request,
        @Body() dto: {
            displayName: string;
            avatarUrl?: string;
        }
    ): Promise<{
        persona: {
            id: string;
            displayName: string;
            avatarUrl?: string;
            trustLevel: 'NEW' | 'REGULAR' | 'TRUSTED';
            createdAt: string;
        };
        correlationId: string;
    }> {
        const session = (req as any).session;
        if (!session?.accountabilityProfileId) {
            throw new UnauthorizedException();
        }

        const persona = await this.personaService.createPersona({
            accountabilityProfileId: session.accountabilityProfileId,
            displayName: dto.displayName,
            avatarUrl: dto.avatarUrl,
        });

        return {
            persona,
            correlationId: this.generateCorrelationId(),
        };
    }

    @Post(':id/rotate')
    async rotatePersona(
        @Param('id') personaId: string,
        @Req() req: Request,
        @Body() dto: {
            newDisplayName: string;
        }
    ): Promise<{
        persona: {
            id: string;
            displayName: string;
            avatarUrl?: string;
            trustLevel: 'NEW' | 'REGULAR' | 'TRUSTED';
            createdAt: string;
        };
        correlationId: string;
    }> {
        const session = (req as any).session;
        if (!session?.accountabilityProfileId) {
            throw new UnauthorizedException();
        }

        const newPersona = await this.personaService.rotatePersona({
            oldPersonaId: personaId,
            newDisplayName: dto.newDisplayName,
            accountabilityProfileId: session.accountabilityProfileId,
        });

        return {
            persona: newPersona,
            correlationId: this.generateCorrelationId(),
        };
    }

    private generateCorrelationId(): string {
        return randomUUID();
    }
}
