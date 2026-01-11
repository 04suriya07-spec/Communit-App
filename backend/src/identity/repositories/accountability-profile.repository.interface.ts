import { AccountabilityProfile, RiskLevel } from '@prisma/client';

/**
 * AccountabilityProfile Repository Interface
 * 
 * INTERNAL ONLY - NEVER expose in public APIs
 * This entity tracks abuse and risk - must remain invisible to users
 */
export interface IAccountabilityProfileRepository {
    /**
     * Find by auth profile ID
     */
    findByAuthProfileId(authProfileId: string): Promise<AccountabilityProfile | null>;

    /**
     * Create new accountability profile
     * Defaults: globalAbuseScore = 0.0, riskLevel = LOW
     */
    create(data: {
        authProfileId: string;
        globalAbuseScore?: number;
        riskLevel?: RiskLevel;
    }): Promise<AccountabilityProfile>;

    /**
     * Update abuse score (called by Trust & Safety Service)
     */
    updateAbuseScore(id: string, score: number): Promise<AccountabilityProfile>;

    /**
     * Update risk level (called by Trust & Safety Service)
     */
    updateRiskLevel(id: string, level: RiskLevel): Promise<AccountabilityProfile>;

    /**
     * Find by ID (internal only)
     */
    findById(id: string): Promise<AccountabilityProfile | null>;
}
