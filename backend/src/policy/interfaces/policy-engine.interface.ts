/**
 * PolicyEngine Interface
 */
export interface IPolicyEngine {
    /**
     * Evaluate if action is allowed based on policy
     * Returns true if allowed, false otherwise
     */
    evaluate(policyName: string, context: Record<string, any>): boolean;

    /**
     * Get numeric policy value
     * Supports trust-level-based lookups
     */
    getNumericValue(policyName: string, context?: Record<string, any>): number;

    /**
     * Get raw policy configuration
     */
    getPolicy(policyName: string): any;
}
