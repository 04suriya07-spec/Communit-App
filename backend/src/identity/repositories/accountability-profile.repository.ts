import { Injectable } from '@nestjs/common';
import { PrismaClient, AccountabilityProfile, RiskLevel } from '@prisma/client';
import { IAccountabilityProfileRepository } from './accountability-profile.repository.interface';

/**
 * AccountabilityProfile Repository Implementation
 * 
 * INTERNAL ONLY - NEVER expose in public APIs
 * This tracks abuse scores and risk levels invisibly
 */
@Injectable()
export class AccountabilityProfileRepository implements IAccountabilityProfileRepository {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * Find by auth profile ID
     */
    async findByAuthProfileId(authProfileId: string): Promise<AccountabilityProfile | null> {
        return this.prisma.accountabilityProfile.findFirst({
            where: { authProfileId },
        });
    }

    /**
     * Create accountability profile
     * Defaults: globalAbuseScore = 0.0, riskLevel = LOW
     */
    async create(data: {
        authProfileId: string;
        globalAbuseScore?: number;
        riskLevel?: RiskLevel;
    }): Promise<AccountabilityProfile> {
        return this.prisma.accountabilityProfile.create({
            data: {
                authProfileId: data.authProfileId,
                globalAbuseScore: data.globalAbuseScore ?? 0.0,
                riskLevel: data.riskLevel ?? RiskLevel.LOW,
            },
        });
    }

    /**
     * Update abuse score (called by Trust & Safety Service)
     */
    async updateAbuseScore(id: string, score: number): Promise<AccountabilityProfile> {
        return this.prisma.accountabilityProfile.update({
            where: { id },
            data: { globalAbuseScore: score },
        });
    }

    /**
     * Update risk level (called by Trust & Safety Service)
     */
    async updateRiskLevel(id: string, level: RiskLevel): Promise<AccountabilityProfile> {
        return this.prisma.accountabilityProfile.update({
            where: { id },
            data: { riskLevel: level },
        });
    }

    /**
     * Find by ID (internal only)
     */
    async findById(id: string): Promise<AccountabilityProfile | null> {
        return this.prisma.accountabilityProfile.findUnique({
            where: { id },
        });
    }
}
