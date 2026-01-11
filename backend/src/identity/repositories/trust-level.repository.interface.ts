import { TrustLevel } from '@prisma/client';

/**
 * TrustLevel Repository Interface
 * 
 * Phase 1: Manual promotion only (no auto-promotion logic)
 */
export interface ITrustLevelRepository {
    /**
     * Find trust level by persona ID
     */
    findByPersonaId(personaId: string): Promise<TrustLevel | null>;

    /**
     * Create trust level for new persona
     * Default level is NEW
     */
    create(data: {
        personaId: string;
        level: 'NEW' | 'REGULAR' | 'TRUSTED';
    }): Promise<TrustLevel>;

    /**
     * Update trust level (Phase 1: admin tools only)
     * Phase 1: Manual promotion only - no public API
     */
    update(personaId: string, level: 'NEW' | 'REGULAR' | 'TRUSTED'): Promise<TrustLevel>;
}
