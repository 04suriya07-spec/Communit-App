import { Persona } from '@prisma/client';

/**
 * Persona Repository Interface
 * 
 * Public-facing identity layer
 * Safe to expose persona.id, but NEVER expose accountabilityProfileId
 */
export interface IPersonaRepository {
    /**
     * Find persona by ID
     */
    findById(id: string): Promise<Persona | null>;

    /**
     * Find active personas by accountability profile ID
     * Returns only: is_active = true AND deleted_at = null
     */
    findActiveByAccountabilityProfileId(
        accountabilityProfileId: string
    ): Promise<Persona[]>;

    /**
     * Create new persona
     */
    create(data: {
        accountabilityProfileId: string;
        displayName: string;
        avatarUrl?: string;
    }): Promise<Persona>;

    /**
     * Deactivate persona (sets is_active = false)
     * Used during rotation
     */
    deactivate(id: string): Promise<Persona>;

    /**
     * Soft delete (sets deleted_at = now())
     * Hard delete happens async after retention period
     */
    softDelete(id: string): Promise<Persona>;

    /**
     * Find recent persona by display name (for uniqueness check)
     * Prevents impersonation within time window
     */
    findRecentByDisplayName(
        displayName: string,
        withinDays: number
    ): Promise<Persona | null>;
}
