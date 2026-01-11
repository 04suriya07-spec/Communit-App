import { Injectable } from '@nestjs/common';
import { policyConfig, PolicyConfig, TrustLevel } from '../config/policy-config';
import { IPolicyEngine } from '../interfaces/policy-engine.interface';

/**
 * PolicyEngine Service
 * 
 * Synchronous, read-only, deterministic policy evaluation
 * Phase 1: In-memory policies
 */
@Injectable()
export class PolicyEngineService implements IPolicyEngine {
    private readonly policies: PolicyConfig;

    constructor() {
        this.policies = policyConfig;
    }

    /**
     * Evaluate if action is allowed based on policy
     */
    evaluate(policyName: string, context: Record<string, any>): boolean {
        switch (policyName) {
            case 'persona_creation_allowed':
                return this.evaluatePersonaCreation(context as any);

            case 'post_rate_limit':
                return this.evaluatePostRateLimit(context as any);

            case 'persona_rotation_allowed':
                return this.evaluatePersonaRotation(context as any);

            default:
                throw new Error(`Unknown policy: ${policyName}`);
        }
    }

    /**
     * Get numeric value from policy
     * Supports trust-level-based lookups
     */
    getNumericValue(policyName: string, context?: Record<string, any>): number {
        const policy = this.policies[policyName as keyof PolicyConfig];

        if (typeof policy === 'number') {
            return policy;
        }

        // Handle trust-level-based policies
        if (typeof policy === 'object' && context?.trustLevel) {
            const trustLevel = context.trustLevel as TrustLevel;
            return (policy as any)[trustLevel] || (policy as any).NEW;
        }

        throw new Error(`Cannot get numeric value for policy: ${policyName}`);
    }

    /**
     * Get raw policy configuration
     */
    getPolicy(policyName: string): any {
        return this.policies[policyName as keyof PolicyConfig];
    }

    // ============================================================
    // PRIVATE EVALUATION METHODS
    // ============================================================

    /**
     * Evaluate persona creation limit
     */
    private evaluatePersonaCreation(context: {
        currentPersonaCount: number;
        trustLevel: TrustLevel;
    }): boolean {
        const maxAllowed = this.policies.persona_max_count[context.trustLevel];
        return context.currentPersonaCount < maxAllowed;
    }

    /**
     * Evaluate post rate limit
     */
    private evaluatePostRateLimit(context: {
        recentPostCount: number;
        trustLevel: TrustLevel;
        accountRecentPostCount?: number;
    }): boolean {
        // Check persona-level limit
        const personaLimit = this.policies.post_rate_limit_hourly_by_trust[context.trustLevel];
        if (context.recentPostCount >= personaLimit) {
            return false;
        }

        // Check account-level limit (if provided)
        if (context.accountRecentPostCount !== undefined) {
            const accountLimit = this.policies.post_rate_limit_hourly_account_total;
            if (context.accountRecentPostCount >= accountLimit) {
                return false;
            }
        }

        return true;
    }

    /**
     * Evaluate persona rotation cooldown
     */
    private evaluatePersonaRotation(context: {
        lastRotationDate?: Date;
    }): boolean {
        if (!context.lastRotationDate) {
            return true; // First rotation always allowed
        }

        const cooldownDays = this.policies.persona_rotation_cooldown_days;
        const daysSince = Math.floor(
            (Date.now() - context.lastRotationDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        return daysSince >= cooldownDays;
    }
}
