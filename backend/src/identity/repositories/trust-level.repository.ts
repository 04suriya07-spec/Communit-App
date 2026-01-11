import { Injectable } from '@nestjs/common';
import { PrismaClient, TrustLevel, TrustLevelEnum } from '@prisma/client';
import { ITrustLevelRepository } from './trust-level.repository.interface';

/**
 * TrustLevel Repository Implementation
 * 
 * Phase 1: Manual promotion only (no auto-promotion logic)
 */
@Injectable()
export class TrustLevelRepository implements ITrustLevelRepository {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * Find trust level by persona ID
     */
    async findByPersonaId(personaId: string): Promise<TrustLevel | null> {
        return this.prisma.trustLevel.findFirst({
            where: { personaId },
            orderBy: { grantedAt: 'desc' },
        });
    }

    /**
     * Create trust level for new persona
     * Default level is NEW
     */
    async create(data: {
        personaId: string;
        level: 'NEW' | 'REGULAR' | 'TRUSTED';
    }): Promise<TrustLevel> {
        return this.prisma.trustLevel.create({
            data: {
                personaId: data.personaId,
                level: data.level as TrustLevelEnum,
            },
        });
    }

    /**
     * Update trust level (Phase 1: admin tools only)
     * Phase 1: Manual promotion only - no public API
     */
    async update(
        personaId: string,
        level: 'NEW' | 'REGULAR' | 'TRUSTED'
    ): Promise<TrustLevel> {
        // Find the current trust level
        const current = await this.findByPersonaId(personaId);

        if (!current) {
            throw new Error('No trust level found for persona');
        }

        // Create new trust level record (history tracking)
        return this.prisma.trustLevel.create({
            data: {
                personaId,
                level: level as TrustLevelEnum,
            },
        });
    }
}
