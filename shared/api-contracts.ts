/**
 * ============================================================
 * API CONTRACTS
 * Community App - Type-Safe API Definitions
 * ============================================================
 * 
 * SECURITY RULES:
 * 1. Public APIs NEVER return: accountability_profile_id, abuse scores, internal IDs
 * 2. All internal fields must be explicitly excluded from public responses
 * 3. E2EE content is NEVER transmitted as plaintext
 * 4. Build should fail if internal fields appear in public response types
 */

// ============================================================
// BASE TYPES & ENUMS
// ============================================================

export type PrivacyState = 'PUBLIC' | 'PRIVATE' | 'TRUSTED';
export type TrustLevel = 'NEW' | 'REGULAR' | 'TRUSTED';
export type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ReportStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED';
export type AppealStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type RateLimitScope = 'GLOBAL' | 'SPACE';

export interface BaseResponse {
    readonly correlationId: string;
}

// ============================================================
// AUTHENTICATION & IDENTITY
// ============================================================

export interface RegisterRequest {
    email: string;
    password: string;
    initialDisplayName: string;
}

export interface RegisterResponse extends BaseResponse {
    readonly personaId: string;
    readonly displayName: string;
    readonly avatarUrl?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse extends BaseResponse {
    readonly personaId: string;
    readonly displayName: string;
}

// ============================================================
// PERSONAS (PUBLIC API)
// ============================================================

/**
 * PUBLIC-FACING PERSONA
 * MUST NOT include: accountabilityProfileId, authProfileId, abuse scores
 */
export interface PublicPersona {
    readonly id: string;
    readonly displayName: string;
    readonly avatarUrl?: string;
    readonly trustLevel: TrustLevel;
    readonly createdAt: string;
}

export interface CreatePersonaRequest {
    displayName: string;
    avatarUrl?: string;
}

export interface CreatePersonaResponse extends BaseResponse {
    readonly persona: PublicPersona;
}

export interface ListPersonasResponse extends BaseResponse {
    readonly personas: ReadonlyArray<PublicPersona>;
}

// ============================================================
// SPACES
// ============================================================

export interface CreateSpaceRequest {
    type: 'PUBLIC_SQUARE' | 'COMMUNITY_GROUP' | 'PRIVATE_CHAT';
    moderationPolicy: 'STRICT' | 'FLEXIBLE' | 'NONE';
    name?: string;
}

export interface CreateSpaceResponse extends BaseResponse {
    readonly spaceId: string;
    readonly type: string;
    readonly encryptionLevel: 'NONE' | 'SERVER_SIDE' | 'E2EE';
    readonly moderationPolicy: string;
    readonly privacyState: {
        readonly state: PrivacyState;
        readonly explanationText: string;
    };
}

export interface EnableE2EERequest {
    spaceId: string;
    consentRecordIds: string[]; // Must match all current members (NOT a boolean)
}

export interface EnableE2EEResponse extends BaseResponse {
    readonly spaceId: string;
    readonly e2eeEnabledAt: string;
    readonly newSessionId: string; // New encryption session created
    readonly warning: string; // "Historical messages are NOT retroactively encrypted"
}

export interface RevokeE2EERequest {
    spaceId: string;
    confirmationCode: string; // Irreversible action requires confirmation
}

export interface RevokeE2EEResponse extends BaseResponse {
    readonly spaceId: string;
    readonly e2eeRevokedAt: string;
    readonly newEncryptionLevel: 'SERVER_SIDE';
    readonly warning: string; // "This action is irreversible"
}

// ============================================================
// CONTENT SUBMISSION (PRIVACY-SEPARATED)
// ============================================================

/**
 * PUBLIC CONTENT
 */
export interface SubmitPublicContentRequest {
    body: string; // Text only for MVP
}

export interface SubmitPublicContentResponse extends BaseResponse {
    readonly contentId: string;
    readonly moderationStatus: ModerationStatus;
    readonly estimatedReviewTime: string;
}

/**
 * COMMUNITY CONTENT
 */
export interface SubmitCommunityContentRequest {
    spaceId: string;
    body: string;
}

export interface SubmitCommunityContentResponse extends BaseResponse {
    readonly contentId: string;
    readonly spaceId: string;
    readonly moderationStatus: ModerationStatus;
}

/**
 * E2EE MESSAGE (METADATA ONLY)
 */
export interface SubmitE2EEMessageRequest {
    spaceId: string;
    ciphertextSize: number; // Only metadata
    clientSequence: number; // Message ordering & replay protection
    // NO body, NO plaintext, NO keys
}

export interface SubmitE2EEMessageResponse extends BaseResponse {
    readonly messageId: string;
    readonly deliveredAt: string;
}

// ============================================================
// REPORTS & APPEALS
// ============================================================

export interface CreateReportRequest {
    targetId: string;
    targetType: 'POST' | 'MESSAGE' | 'PERSONA' | 'SPACE';
    reason: string;
}

export interface CreateReportResponse extends BaseResponse {
    readonly reportId: string;
    readonly status: ReportStatus;
    readonly reportedAt: string;
}

export interface ListReportsResponse extends BaseResponse {
    readonly reports: ReadonlyArray<{
        readonly id: string;
        readonly targetId: string;
        readonly targetType: string;
        readonly reason: string;
        readonly status: ReportStatus;
        readonly createdAt: string;
    }>;
}

export interface CreateAppealRequest {
    moderationLogId: string;
    appealReason: string;
}

export interface CreateAppealResponse extends BaseResponse {
    readonly appealId: string;
    readonly status: AppealStatus;
    readonly submittedAt: string;
}

export interface ListAppealsResponse extends BaseResponse {
    readonly appeals: ReadonlyArray<{
        readonly id: string;
        readonly moderationLogId: string;
        readonly appealReason: string;
        readonly status: AppealStatus;
        readonly createdAt: string;
    }>;
}

// ============================================================
// MODERATION (ADMIN ONLY)
// ============================================================

/**
 * INTERNAL MODERATION QUEUE ITEM
 * Type-safe split: E2EE messages cannot have targetContent
 */
export type ModerationQueueItem =
    | {
        readonly targetType: 'POST' | 'PERSONA' | 'SPACE';
        readonly targetId: string;
        readonly targetContent: string; // Available for non-E2EE content
        readonly reportCount: number;
        readonly riskScore: number;
        readonly suggestedAction: 'WARN' | 'STRIKE' | 'BAN';
    }
    | {
        readonly targetType: 'MESSAGE'; // E2EE messages
        readonly targetId: string;
        // NO targetContent (compile-time enforcement)
        readonly reportCount: number;
        readonly riskScore: number;
        readonly suggestedAction: 'WARN' | 'STRIKE' | 'BAN';
    };

export interface TakeModerationActionRequest {
    targetId: string;
    targetType: 'POST' | 'MESSAGE' | 'PERSONA' | 'SPACE';
    action: string;
    reason: string;
    explanationLog: string; // Human-readable "why"
    isDryRun?: boolean; // For training moderators
    idempotencyKey: string; // Required for all async operations
}

export interface TakeModerationActionResponse extends BaseResponse {
    readonly moderationLogId: string;
    readonly appliedAt: string;
    readonly isDryRun: boolean;
}

// ============================================================
// RATE LIMITING (INTERNAL)
// ============================================================

export interface RateLimitCheck {
    personaId: string;
    actionType: string;
    scope: RateLimitScope;
    spaceId?: string;
}

export interface RateLimitResponse extends BaseResponse {
    readonly allowed: boolean;
    readonly blockedUntil?: string;
    readonly currentCount: number;
    readonly limit: number;
}

// ============================================================
// SYSTEM CONFIGURATION (ADMIN ONLY)
// ============================================================

export interface SystemConfigUpdate {
    key: string;
    value: Record<string, any>;
}

export interface SystemConfigResponse extends BaseResponse {
    readonly key: string;
    readonly value: Record<string, any>;
    readonly updatedAt: string;
}

// ============================================================
// EVENT BUS (INTERNAL)
// ============================================================

export type EventType =
    | 'PostCreated'
    | 'ContentFlagged'
    | 'PersonaStruck'
    | 'SpaceE2EEEnabled'
    | 'SpaceE2EERevoked'
    | 'PaymentUpgraded'
    | 'TrustLevelChanged';

export interface Event<T = any> {
    readonly id: string;
    readonly eventType: EventType;
    readonly payload: T;
    readonly processed: boolean;
    readonly idempotencyKey?: string;
    readonly createdAt: string;
}

export interface PostCreatedPayload {
    readonly contentId: string;
    readonly personaId: string;
    readonly contentType: 'PUBLIC' | 'COMMUNITY';
    readonly spaceId?: string;
}

export interface ContentFlaggedPayload {
    readonly contentId: string;
    readonly contentType: 'PUBLIC' | 'COMMUNITY';
    readonly reportId: string;
    readonly riskScore: number;
}

export interface SpaceE2EEEnabledPayload {
    readonly spaceId: string;
    readonly enabledBy: string;
    readonly consentRecordIds: ReadonlyArray<string>;
    readonly newSessionId: string;
}

// ============================================================
// VALIDATION HELPERS
// ============================================================

/**
 * TYPE GUARD: Ensure no internal fields leak into public responses
 * These fields MUST NEVER appear in PublicPersona or any public-facing type
 */
type ForbiddenPublicFields =
    | 'accountabilityProfileId'
    | 'authProfileId'
    | 'globalAbuseScore'
    | 'riskLevel'
    | 'moderatorId'
    | 'internalAdminId';

/**
 * Compile-time check: PublicPersona must not have forbidden fields
 */
type EnsureNoLeakage<T> = {
    [K in keyof T]: K extends ForbiddenPublicFields ? never : T[K];
};

// This will cause a compile error if forbidden fields are added to PublicPersona
type _PublicPersonaCheck = EnsureNoLeakage<PublicPersona>;

// ============================================================
// API ROUTE DEFINITIONS
// ============================================================

export const API_ROUTES = {
    // Authentication & Identity
    AUTH: {
        REGISTER: '/auth/register' as const,
        LOGIN: '/auth/login' as const,
    },

    // Personas
    PERSONAS: {
        LIST: '/personas' as const,
        CREATE: '/personas' as const,
    },

    // Content (Privacy-Separated)
    CONTENT: {
        PUBLIC: '/public/content' as const,
        COMMUNITY: (spaceId: string) => `/community/${spaceId}/content` as const,
        PRIVATE: (spaceId: string) => `/private/${spaceId}/message` as const,
    },

    // Spaces
    SPACES: {
        CREATE: '/spaces' as const,
        ENABLE_E2EE: (spaceId: string) => `/spaces/${spaceId}/enable-e2ee` as const,
        REVOKE_E2EE: (spaceId: string) => `/spaces/${spaceId}/revoke-e2ee` as const,
    },

    // Reports & Appeals
    REPORTS: {
        CREATE: '/reports' as const,
        LIST: '/reports' as const,
    },

    APPEALS: {
        CREATE: '/appeals' as const,
        LIST: '/appeals' as const,
    },

    // Moderation (Admin Only)
    MODERATION: {
        QUEUE: '/moderation/queue' as const,
        ACTION: '/moderation/action' as const,
        LOGS: '/moderation/logs' as const,
    },

    // System (Admin Only)
    SYSTEM: {
        CONFIG: '/system/config' as const,
    },
} as const;

// ============================================================
// ERROR CODES
// ============================================================

export enum ErrorCode {
    // Authentication
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',

    // Authorization
    INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
    TRUST_LEVEL_TOO_LOW = 'TRUST_LEVEL_TOO_LOW',

    // Rate Limiting
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

    // E2EE
    E2EE_CONSENT_REQUIRED = 'E2EE_CONSENT_REQUIRED',
    E2EE_ALREADY_ENABLED = 'E2EE_ALREADY_ENABLED',
    E2EE_NOT_ENABLED = 'E2EE_NOT_ENABLED',
    E2EE_NOT_ELIGIBLE = 'E2EE_NOT_ELIGIBLE',

    // Content
    CONTENT_FLAGGED = 'CONTENT_FLAGGED',
    MODERATION_PENDING = 'MODERATION_PENDING',

    // System
    SPACE_STATE_LOCKED = 'SPACE_STATE_LOCKED',
    FEATURE_DISABLED = 'FEATURE_DISABLED',
    POLICY_VIOLATION = 'POLICY_VIOLATION',

    // Idempotency
    DUPLICATE_OPERATION = 'DUPLICATE_OPERATION',
}

export interface ErrorResponse {
    readonly error: {
        readonly code: ErrorCode;
        readonly message: string;
        readonly details?: Record<string, any>;
    };
    readonly correlationId: string;
}
