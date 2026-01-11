/**
 * Policy Configuration
 * 
 * Centralized policy rules for the entire platform
 * Phase 1: In-memory configuration
 * Phase 2: Load from database `policies` table
 */

export const policyConfig = {
    // ============================================================
    // IDENTITY POLICIES
    // ============================================================

    /**
     * Maximum personas per user (by trust level)
     */
    persona_max_count: {
        NEW: 3,
        REGULAR: 5,
        TRUSTED: 10,
    },

    /**
     * Persona rotation cooldown (days between rotations)
     */
    persona_rotation_cooldown_days: 30,

    /**
     * Maximum persona rotations per month (not implemented yet)
     */
    persona_rotation_max_per_month: 2,

    /**
     * Display name uniqueness window (days)
     * Prevents impersonation by blocking recently used names
     */
    display_name_uniqueness_window_days: 30,

    // ============================================================
    // POSTING POLICIES
    // ============================================================

    /**
     * Post rate limit per hour (by trust level)
     */
    post_rate_limit_hourly_by_trust: {
        NEW: 10,
        REGULAR: 20,
        TRUSTED: 50,
    },

    /**
     * Account-wide post rate limit per hour
     * Prevents multi-persona abuse
     */
    post_rate_limit_hourly_account_total: 30,

    /**
     * Post body length constraints
     */
    post_body_max_length: 5000,
    post_body_min_length: 1,

    // ============================================================
    // TRUST & SAFETY POLICIES
    // ============================================================

    /**
     * Abuse score thresholds for risk level classification
     */
    abuse_score_threshold_low: 0.3,    // < 0.3 = LOW
    abuse_score_threshold_medium: 0.7, // 0.3-0.7 = MEDIUM, >= 0.7 = HIGH
};

export type PolicyConfig = typeof policyConfig;
export type TrustLevel = 'NEW' | 'REGULAR' | 'TRUSTED';
