# Identity Service Specification v1.0

**Status**: Implementation-ready  
**Phase**: Execution Phase 1  
**Priority**: Keystone (must be built first)

## Purpose

The Identity Service answers exactly five questions:

1. **Who is this user internally?** (auth → accountability mapping)
2. **What personas are currently attached?** (accountability → personas)
3. **Which persona is active in this context?** (request → persona resolution)
4. **What accountability metadata follows the user invisibly?** (abuse scores, risk level)
5. **What actions are allowed right now under policy?** (trust level, rate limits)

**It answers nothing else.**

## Entity Relationships

```
auth_profiles (1) ──→ (1) accountability_profiles
                              ↓
                         (1 to many)
                              ↓
                          personas ──→ (1) trust_levels
```

### Flow

```
User logs in (Firebase)
    ↓
Identity Service resolves email_hash
    ↓
Retrieves auth_profile
    ↓
Retrieves linked accountability_profile
    ↓
Lists active personas
    ↓
Returns session context (no internal IDs leaked)
```

## Core Entities

### 1. AuthProfile (Authentication Layer)

**Purpose**: Minimal authentication identity.

**Fields**:
- `id`: UUID (internal, never exposed)
- `email_encrypted`: For recovery/login flows
- `email_hash`: For lookups (NEVER query by email_encrypted)
- `auth_provider`: 'firebase' (default)

**Lifetime**: Permanent (unless user requests deletion)

**Access**: Identity Service only

### 2. AccountabilityProfile (Internal Layer)

**Purpose**: Invisible abuse tracking.

**Fields**:
- `id`: UUID (internal, never exposed)
- `auth_profile_id`: Link to auth
- `global_abuse_score`: Float (0.0 = clean, 1.0 = max risk)
- `is_verified`: Boolean (payment verification)
- `risk_level`: LOW | MEDIUM | HIGH

**Lifetime**: Permanent (survives persona rotation)

**Access**: Identity Service + Trust & Safety Service

**Critical Rule**: This entity is **NEVER** returned in public APIs.

### 3. Persona (Presentation Layer)

**Purpose**: Public-facing identity (anonymous alias).

**Fields**:
- `id`: UUID (public, safe to expose)
- `accountability_profile_id`: Link to internal tracking
- `display_name`: User-chosen alias
- `avatar_url`: Optional
- `is_active`: Boolean (soft deactivation)
- `deleted_at`: Timestamp (soft delete)

**Lifetime**: Can be rotated/deactivated by user

**Access**: Public APIs (but never expose `accountability_profile_id`)

### 4. TrustLevel (Progression Tracking)

**Purpose**: Unlock capabilities as users prove trustworthiness.

**Fields**:
- `persona_id`: Link to persona
- `level`: NEW | REGULAR | TRUSTED
- `granted_at`: Timestamp

**Lifetime**: Tied to persona (resets on rotation)

**Progression**:
- **NEW**: Default for all new personas
- **REGULAR**: After X verified posts, Y days active
- **TRUSTED**: Manual promotion or long history

## Persona Lifecycle

### Creation

```typescript
// Request
POST /personas
{
  displayName: "CryptoFan99",
  avatarUrl: "https://..."
}

// Internal flow
1. Verify user has accountability_profile
2. Check policy: "max_personas_per_user" (default: 3)
3. Check policy: "persona_creation_rate_limit"
4. Create persona with is_active = true
5. Create trust_level (NEW)
6. Return public persona (NO internal IDs)
```

**Constraints**:
- Max 3 personas per accountability_profile (configurable via policy)
- Display names must be unique within 30 days (prevent impersonation)
- Rate limit: 1 persona creation per 7 days

### Rotation

**When**: User wants privacy reset (harassment, fresh start).

**Flow**:
```typescript
POST /personas/{id}/rotate
{
  newDisplayName: "AnonUser42"
}

// Internal flow
1. Verify persona belongs to user
2. Set old persona: is_active = false, deleted_at = now()
3. Create new persona (linked to same accountability_profile)
4. Trust level: Reset to NEW
5. Abuse score: PERSISTS (linked to accountability_profile)
6. Return new persona
```

**Critical**: Accountability follows the user invisibly.

### Deactivation (Soft Delete)

**When**: User wants to pause a persona without deletion.

```typescript
POST /personas/{id}/deactivate

// Internal flow
1. Set is_active = false
2. Set deleted_at = now() + 90 days (grace period)
3. Persona hidden from public view immediately
4. Hard delete after 90 days (unless legal_hold = true)
```

### Permanent Deletion

**When**: User requests GDPR/CCPA deletion.

```typescript
POST /personas/{id}/delete-permanent

// Internal flow
1. Verify no legal_hold
2. Anonymize display_name (hash)
3. Remove avatar_url
4. Set deleted_at = now()
5. Schedule hard delete (90 days)
```

**Exception**: If `legal_hold = true`, deletion is blocked until hold released.

## Abuse Score Linkage (Placeholder)

**Current Phase**: No logic, only structure.

**Data Flow**:
```
Moderation event (persona flagged)
    ↓
Event bus processes
    ↓
Abuse scoring worker (future)
    ↓
Updates accountability_profile.global_abuse_score
    ↓
Persona rotation does NOT reset this score
```

**Critical**: Abuse score is tied to `accountability_profile`, not `persona`.

**Rules** (not implemented yet, but structure supports):
- Score 0.0–0.3: Low risk (normal rate limits)
- Score 0.3–0.7: Medium risk (stricter limits, moderation delay)
- Score 0.7–1.0: High risk (manual review only, limited posting)

## Edge Cases

### 1. Banned User Tries to Create New Persona

**Scenario**: User with `risk_level = HIGH` tries to create persona.

**Behavior**:
```typescript
if (accountabilityProfile.risk_level === 'HIGH') {
  throw new Error('ACCOUNT_SUSPENDED');
}
```

**Result**: Cannot create persona, must appeal.

### 2. User Rotates Persona to Evade Ban

**Scenario**: User rotates persona after moderation strike.

**Behavior**:
- Old persona: Flagged, is_active = false
- New persona: Created, but inherits HIGH risk_level
- New persona posts: Automatically queued for manual review

**Result**: Rotation does NOT reset accountability.

### 3. Multiple Personas in Same Space

**Scenario**: User joins Space A with Persona1, then joins with Persona2.

**Behavior**:
```typescript
// Check during space join
const existingMemberships = await db.space_members.findMany({
  where: {
    space_id: spaceId,
    persona: {
      accountability_profile_id: currentUser.accountabilityProfileId
    }
  }
});

if (existingMemberships.length > 0) {
  throw new Error('ALREADY_MEMBER');
}
```

**Result**: One accountability_profile = one membership per space (across all personas).

### 4. Persona Rotation During Active Moderation

**Scenario**: User rotates persona while appeal is pending.

**Behavior**:
- Appeal remains attached to old persona
- Old persona: is_active = false (but not deleted until appeal resolved)
- New persona: Can be created, but risk_level inherited

**Result**: Cannot escape moderation via rotation.

### 5. Verified User Loses Verification on Rotation

**Scenario**: User paid for verification, then rotates persona.

**Behavior**:
- `accountability_profile.is_verified` = true (persists)
- Old persona: Shows verified badge (until deactivated)
- New persona: Shows verified badge (inherits from accountability_profile)

**Result**: Verification follows the user, not the persona.

## API Contracts (From Frozen Spec)

### Register

```typescript
POST /auth/register
Request: {
  email: string,
  password: string,
  initialDisplayName: string
}

Response: {
  personaId: string, // NEW persona
  displayName: string,
  correlationId: string
}

// Internal creates:
// 1. auth_profile (email_hash for future logins)
// 2. accountability_profile (default risk = LOW)
// 3. persona (initial, is_active = true)
// 4. trust_level (NEW)
```

### Login

```typescript
POST /auth/login
Request: {
  email: string,
  password: string
}

Response: {
  personaId: string, // Active persona (or prompt to select)
  displayName: string,
  correlationId: string
}

// Session includes (internal only):
// - accountabilityProfileId (for abuse checks)
// - currentPersonaId (for actions)
// - trustLevel (for policy checks)
```

### List Personas

```typescript
GET /personas

Response: {
  personas: [
    {
      id: string,
      displayName: string,
      avatarUrl: string | null,
      trustLevel: 'NEW' | 'REGULAR' | 'TRUSTED',
      createdAt: string
    }
  ],
  correlationId: string
}

// NEVER includes:
// - accountabilityProfileId
// - globalAbuseScore
// - riskLevel
```

## Integration Points

### With Policy Engine

**Questions Identity Service asks Policy Engine**:
1. "Can this user create a new persona?" (check `max_personas_per_user`)
2. "Is persona rotation rate-limited?" (check `persona_rotation_cooldown`)
3. "Is this action allowed for trust level X?" (check `min_trust_level_for_action`)

**Policy Engine returns**: `{ allowed: boolean, reason?: string }`

### With Trust & Safety Service

**Information shared**:
- When persona flagged → T&S gets `personaId` + `accountabilityProfileId` (internal)
- When ban applied → T&S updates `accountability_profile.risk_level`
- When appeal resolved → T&S may adjust `global_abuse_score`

**Critical**: Public moderation UI shows `personaId` only. Internal tools show both.

### With Event Bus

**Events emitted**:
- `PersonaCreated`: `{ personaId, accountabilityProfileId, trustLevel }`
- `PersonaRotated`: `{ oldPersonaId, newPersonaId, accountabilityProfileId }`
- `PersonaDeactivated`: `{ personaId, reason }`

**Consumers**:
- Analytics (user growth, rotation rate)
- Abuse detection (future)
- Audit logs

## Implementation Constraints

### What Identity Service DOES

- Auth provider → internal ID resolution
- Persona CRUD (create, read, rotate, deactivate)
- Trust level queries (no promotion logic yet)
- Abuse score storage (no calculation logic yet)
- Policy integration (evaluation only)

### What Identity Service DOES NOT DO

- Social graph (no friends, followers)
- Messaging (handled by separate service)
- Discovery (no recommendations)
- Profile enrichment (no bio, interests, etc.)
- Trust level promotion (manual only in Phase 1)
- Abuse score calculation (placeholder only)

## Testing Requirements

### Unit Tests

1. Email hashing (always query by hash, never plaintext)
2. Persona creation (enforces max limit)
3. Rotation (old persona deactivated, new persona created)
4. Ban enforcement (HIGH risk blocks persona creation)
5. Trust level inheritance (verified status persists)

### Integration Tests

1. Register → creates auth + accountability + persona
2. Login → retrieves correct persona based on email_hash
3. Rotation → accountability_profile unchanged
4. Multiple personas → same user can have up to 3

### Security Tests

1. Public API never returns `accountabilityProfileId`
2. Email lookup always uses `email_hash`
3. Deleted personas (soft delete) hidden from public queries

## Success Criteria

Identity Service is complete when:

1. ✅ Users can register (creates 3 entities correctly)
2. ✅ Users can log in (resolves via email_hash)
3. ✅ Users can create personas (up to policy limit)
4. ✅ Users can rotate personas (accountability persists)
5. ✅ Public APIs never leak internal IDs (type-checked)
6. ✅ Banned users cannot create personas
7. ✅ All tests pass

**Non-goals for Phase 1**:
- Trust level auto-promotion (manual only)
- Abuse score calculation (placeholder only)
- Verification flow (future)

## Next Service Dependency

Once Identity Service is complete:

**Blocked services can proceed**:
- Policy Engine (needs persona context)
- Public Posting (needs persona resolution)
- Trust & Safety Dashboard (needs accountability linkage)

**Still blocked**:
- E2EE Messaging (Phase 2)
- Media uploads (Phase 2)
- Notifications (Phase 2)

---

**Version**: 1.0  
**Phase**: Execution Phase 1  
**Status**: Ready for implementation  
**Frozen**: Schema + API contracts locked
