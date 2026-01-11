import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { PersonaRepository } from '../repositories/persona.repository';
import { TrustLevelRepository } from '../repositories/trust-level.repository';
import { PolicyEngineService } from '../../policy/services/policy-engine.service';

/**
 * Persona Service
 * 
 * Handles persona lifecycle: create, rotate, list
 * Enforces policy limits and display name uniqueness
 */
@Injectable()
export class PersonaService {
    constructor(
        private readonly personaRepo: PersonaRepository,
        private readonly trustLevelRepo: TrustLevelRepository,
        private readonly policyEngine: PolicyEngineService,
        // TODO: Add EventBusService when implemented
    ) { }

    /**
     * Create new persona
     * Enforces policy limits (max 3 per user, rate limiting)
     */
    async createPersona(data: {
        accountabilityProfileId: string;
        displayName: string;
        avatarUrl?: string;
    }): Promise<{
        id: string;
        displayName: string;
        avatarUrl?: string;
        trustLevel: 'NEW' | 'REGULAR' | 'TRUSTED';
        createdAt: string;
    }> {
        // 1. Check policy: max personas per user
        const existingPersonas = await this.personaRepo.findActiveByAccountabilityProfileId(
            data.accountabilityProfileId
        );

        // Get trust level for the first persona (or default to NEW)
        const trustLevel = existingPersonas.length > 0
            ? (await this.trustLevelRepo.findByPersonaId(existingPersonas[0].id))?.level || 'NEW'
            : 'NEW';

        // Check policy limit
        const allowed = this.policyEngine.evaluate('persona_creation_allowed', {
            currentPersonaCount: existingPersonas.length,
            trustLevel,
        });

        if (!allowed) {
            throw new ForbiddenException('MAX_PERSONAS_REACHED');
        }

        // 2. Check display name uniqueness (policy-driven window)
        const uniquenessWindowDays = this.policyEngine.getNumericValue(
            'display_name_uniqueness_window_days'
        );
        const recentlyUsed = await this.personaRepo.findRecentByDisplayName(
            data.displayName,
            uniquenessWindowDays
        );
        if (recentlyUsed) {
            throw new ConflictException('DISPLAY_NAME_RECENTLY_USED');
        }

        // 3. Create persona
        const persona = await this.personaRepo.create({
            accountabilityProfileId: data.accountabilityProfileId,
            displayName: data.displayName,
            avatarUrl: data.avatarUrl,
        });

        // 4. Create trust level (default NEW)
        await this.trustLevelRepo.create({
            personaId: persona.id,
            level: 'NEW',
        });

        // 5. Emit event
        // NOTE: Event emission must be fire-and-forget.
        // IdentityService MUST NOT fail if event bus is temporarily unavailable.
        // TODO: Implement when EventBus is ready
        // await this.eventBus.emit('PersonaCreated', {
        //   personaId: persona.id,
        //   accountabilityProfileId: data.accountabilityProfileId,
        //   trustLevel: 'NEW',
        // });

        // 6. Return public persona (NO internal IDs)
        return this.toPublicPersona(persona);
    }

    /**
     * Rotate persona (fresh start, accountability persists)
     */
    async rotatePersona(data: {
        oldPersonaId: string;
        newDisplayName: string;
        accountabilityProfileId: string; // For verification
    }): Promise<{
        id: string;
        displayName: string;
        avatarUrl?: string;
        trustLevel: 'NEW' | 'REGULAR' | 'TRUSTED';
        createdAt: string;
    }> {
        // 1. Check policy: rotation rate limit
        // TODO: Implement when PolicyEngine is ready
        // const allowed = await this.policyEngine.evaluate('persona_rotation_allowed', {
        //   accountabilityProfileId: data.accountabilityProfileId,
        // });
        // if (!allowed) {
        //   throw new ForbiddenException('ROTATION_RATE_LIMITED');
        // }

        // 2. Verify old persona belongs to user
        const oldPersona = await this.personaRepo.findById(data.oldPersonaId);
        if (!oldPersona || oldPersona.accountabilityProfileId !== data.accountabilityProfileId) {
            throw new ForbiddenException('PERSONA_NOT_OWNED');
        }

        // 3. Deactivate old persona
        await this.personaRepo.deactivate(data.oldPersonaId);

        // 4. Create new persona (uses same accountability profile)
        const newPersona = await this.createPersona({
            accountabilityProfileId: data.accountabilityProfileId,
            displayName: data.newDisplayName,
        });

        // 5. Emit rotation event
        // TODO: Implement when EventBus is ready
        // await this.eventBus.emit('PersonaRotated', {
        //   oldPersonaId: data.oldPersonaId,
        //   newPersonaId: newPersona.id,
        //   accountabilityProfileId: data.accountabilityProfileId,
        // });

        return newPersona;
    }

    /**
     * Get active personas for user
     */
    async getActivePersonas(accountabilityProfileId: string): Promise<Array<{
        id: string;
        displayName: string;
        avatarUrl?: string;
        trustLevel: 'NEW' | 'REGULAR' | 'TRUSTED';
        createdAt: string;
    }>> {
        const personas = await this.personaRepo.findActiveByAccountabilityProfileId(
            accountabilityProfileId
        );

        return Promise.all(personas.map(p => this.toPublicPersona(p)));
    }

    /**
     * Convert internal persona to public-safe format
     * CRITICAL: Never include accountabilityProfileId
     */
    private async toPublicPersona(persona: any): Promise<{
        id: string;
        displayName: string;
        avatarUrl?: string;
        trustLevel: 'NEW' | 'REGULAR' | 'TRUSTED';
        createdAt: string;
    }> {
        const trustLevel = await this.trustLevelRepo.findByPersonaId(persona.id);

        return {
            id: persona.id,
            displayName: persona.displayName,
            avatarUrl: persona.avatarUrl || undefined,
            trustLevel: (trustLevel?.level || 'NEW') as 'NEW' | 'REGULAR' | 'TRUSTED',
            createdAt: persona.createdAt.toISOString(),
            // ❌ NO accountabilityProfileId
            // ❌ NO globalAbuseScore
            // ❌ NO riskLevel
        };
    }
}
