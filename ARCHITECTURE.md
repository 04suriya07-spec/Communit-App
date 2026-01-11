# Architecture Documentation

## Overview

This is a **production-grade communication SaaS platform** where privacy, anonymity, and safety are structural guarantees enforced at the database, type system, and API levels.

## Design Philosophy

### The Core Insight

Most communication platforms treat privacy as a feature toggle. We treat it as a **hard boundary** enforced by:
- Database schema (impossible to store what shouldn't exist)
- Type system (compile-time errors for violations)
- API contracts (no internal fields in public responses)

This means **privacy violations cause build failures**, not runtime bugs.

## System Architecture

```
┌──────────────┐
│   Clavier    │  (Next.js, React Native)
│   Frontend   │  - E2EE client (libsignal)
└──────┬───────┘  - Privacy indicators
       │          - No server access to E2EE plaintext
       ↓
┌──────────────┐
│  Cloudflare  │  - WAF, DDoS protection
│   Edge       │  - Rate limiting (first line)
└──────┬───────┘  - Abuse prevention
       │
       ↓
┌──────────────────────────────────────┐
│         NestJS Backend               │
│  ┌────────────────────────────────┐  │
│  │  Identity Service              │  │
│  │  - auth → accountability →     │  │
│  │    persona mapping             │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  Policy Engine                 │  │
│  │  - Rules as data (JSONB)       │  │
│  │  - No redeploy for changes     │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  Event Bus (Postgres)          │  │
│  │  - Async moderation            │  │
│  │  - Causality tracking          │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  Trust & Safety Service        │  │
│  │  - Independent moderation      │  │
│  │  - Appeals flow                │  │
│  └────────────────────────────────┘  │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────┐
│  PostgreSQL (Supabase)   │
│  - Separated tables      │
│  - CHECK constraints     │
│  - No E2EE plaintext     │
└──────────────────────────┘
```

## The Three Spaces

### Design Constraint

**Privacy level is determined by SPACE, not user or persona.**

This prevents:
- Accidental privacy leaks
- Confused deputy attacks
- User misconfiguration

```
┌─────────────────────────────────────────────┐
│ PUBLIC SPACE                                │
│ ─────────────────────────────────────────── │
│ Encryption: NONE                            │
│ Moderation: STRICT (AI + human)            │
│ Storage: public_content                     │
│ Use case: Discovery, expression, ideas     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ COMMUNITY SPACE                             │
│ ─────────────────────────────────────────── │
│ Encryption: SERVER_SIDE (default)           │
│            E2EE (after trust criteria)      │
│ Moderation: FLEXIBLE (group admins + AI)    │
│ Storage: community_content or e2ee_metadata │
│ Use case: Groups, belonging, discussion     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ PRIVATE SPACE (Paid)                        │
│ ─────────────────────────────────────────── │
│ Encryption: E2EE (mandatory)                │
│ Moderation: NONE (content inaccessible)     │
│ Storage: e2ee_metadata ONLY                 │
│ Use case: Private conversations, trust      │
└─────────────────────────────────────────────┘
```

### E2EE Transition Rules

**Enabling E2EE is a one-way ratchet** (with explicit revocation):

1. Space starts as `NONE` or `SERVER_SIDE`
2. When trust criteria met, owner requests E2EE enable
3. **All members must provide provable consent** (`e2ee_consents` records)
4. System sets `state_lock = true` (blocks new messages)
5. New encryption session created
6. `encryption_level` set to `E2EE`
7. `state_lock = false` (allows E2EE messages)
8. **Historical messages remain server-encrypted** (no retroactive encryption)

**Revocation** (irreversible):
1. Admin/owner requests revocation
2. Confirmation code required
3. `state_lock = true`
4. `encryption_level` set to `SERVER_SIDE`
5. New session created
6. `state_lock = false`
7. **Previous E2EE messages become unreadable** (metadata persists)

**Why state locks?**  
Prevents race conditions where messages are sent during transition, leading to partial encryption states.

## Identity Architecture

### The 3-Layer Model

```
Layer 1: auth_profiles (Authentication)
├─ email_encrypted (for recovery/login)
├─ email_hash (for deduplication)
└─ auth_provider (Firebase)

Layer 2: accountability_profiles (Internal Abuse Tracking)
├─ global_abuse_score
├─ risk_level (LOW, MEDIUM, HIGH)
└─ is_verified

Layer 3: personas (Public-Facing)
├─ display_name
├─ avatar_url
└─ is_active
```

**Critical Rules**:
- Public APIs only expose `personas` data
- `accountability_profiles` is **NEVER** returned in responses
- `auth_profiles` is restricted to authentication services only

**Why separate email_encrypted and email_hash?**
- Query by `email_hash` only (never plaintext)
- `email_encrypted` used for recovery/login flows
- Breach minimization: attacker gets hash, not plaintext

### Trust Levels

Users progress through trust levels based on behavior:

```
NEW → REGULAR → TRUSTED
```

**Unlocked capabilities**:
- `NEW`: Basic posting (strict rate limits)
- `REGULAR`: Group creation, E2EE eligibility
- `TRUSTED`: Higher rate limits, reduced moderation delay

**Enforcement**: `trust_levels` table + policy engine.

## Content Storage (Privacy-Separated)

### Why Separate Tables?

**Alternative (bad)**: One `messages` table with `encryption_level` column.

**Problem**: Developers might accidentally query E2EE content thinking it's available.

**Our approach**: Physically separate tables.

```sql
-- Public content (unencrypted, moderated)
public_content: body TEXT

-- Community content (server-encrypted, moderated)
community_content: body TEXT

-- E2EE messages (metadata ONLY)
e2ee_metadata: ciphertext_size INT, client_sequence INT
               -- NO body column exists
```

**Benefit**: Impossible to accidentally retrieve E2EE plaintext.

## Trust & Safety Architecture

### Independence Principle

Trust & Safety is a **separate system** with its own:
- Admin identity model (`internal_admins`, not `personas`)
- Moderation queue
- Appeals flow
- Audit logs

### Accountable Anonymity

Users are anonymous to each other, but internally accountable.

```
Public View:
  Persona "CryptoFan99" posted in Public Space

Internal View:
  accountability_profile_id: abc-123
  risk_level: MEDIUM
  global_abuse_score: 0.42
  linked reports: [report-1, report-2]
```

**If "CryptoFan99" violates rules**:
- Strike applied to `accountability_profile`
- Persona can be rotated, but accountability persists
- Admin cannot see real email (only internal hash)

### Moderation Flow

```
1. Content posted
   ↓
2. Event created (PostCreated)
   ↓
3. AI moderation scans (async)
   ↓
4. If flagged → ModerationQueue
   ↓
5. Human review (with context)
   ↓
6. Action taken (with explanation_log)
   ↓
7. User can appeal
   ↓
8. Senior moderator reviews
   ↓
9. Overturn or uphold
```

**Audit trail**: Every step has `origin_event_id` linking report → decision → action.

### Dry-Run Mode

New moderators can practice with `is_dry_run = true`:
- Actions are logged but NOT applied
- Trainee sees what WOULD have happened
- No user impact

**Benefit**: Reduces moderation errors.

## Event-Driven Architecture

### Why Events?

**Synchronous approach** (bad):
```
POST /public/content
  → Run moderation (blocks request)
  → Update analytics (blocks request)
  → Send notifications (blocks request)
  → Return response (500ms+ latency)
```

**Event-driven approach**:
```
POST /public/content
  → Emit PostCreated event
  → Return response (50ms latency)

Background:
  → Moderation worker processes event
  → Analytics worker processes event
  → Notification worker processes event
```

### Idempotency Protection

**Problem**: Network retries can cause duplicate actions.

**Solution**: Require `idempotencyKey` for all async operations.

```typescript
// Example: Moderation action
{
  targetId: "post-123",
  action: "REMOVE",
  idempotencyKey: "mod-action-20260110-001"
}
```

**Database enforces uniqueness**:
```sql
CREATE UNIQUE INDEX idx_events_idempotency 
ON events(idempotency_key);
```

**Result**: Duplicate requests are rejected (no double-moderation).

## Policy Engine

### Rules as Data

**Traditional approach** (bad):
```typescript
// Code change required for every rule tweak
if (user.postCount > 10) { ... }
```

**Policy engine approach**:
```sql
INSERT INTO policies (scope, rule_type, config_json) VALUES
  ('PUBLIC', 'RATE_LIMIT', '{"posts_per_hour": 10, "trusted_multiplier": 2}');
```

**Benefits**:
- Change rules without code deploy
- A/B test moderation policies
- Regional compliance (EU vs US rules)
- Regulator transparency (rules are data, not code)

## Rate Limiting

### Dual-Scope Design

**Problem**: Single scope allows abuse.

**Example**:
- User floods Space A (blocked)
- User floods Space B (not blocked, different limit)
- User floods Spaces C, D, E... (distributed spam)

**Solution**: Two scopes.

```sql
CHECK (
  (scope = 'GLOBAL' AND space_id IS NULL) OR
  (scope = 'SPACE' AND space_id IS NOT NULL)
)
```

**GLOBAL**: Limits total actions across all spaces.  
**SPACE**: Limits actions within a single community.

**Enforcement**: Database CHECK constraint prevents misconfiguration.

## Type-Level Security

### Compile-Time Leak Prevention

**Problem**: Developer accidentally exposes internal field.

**Bad code**:
```typescript
// This SHOULD fail to compile
interface PublicPersona {
  id: string;
  displayName: string;
  accountabilityProfileId: string; // ❌ LEAK
}
```

**Enforcement**:
```typescript
type ForbiddenPublicFields =
  | 'accountabilityProfileId'
  | 'authProfileId'
  | 'globalAbuseScore';

type EnsureNoLeakage<T> = {
  [K in keyof T]: K extends ForbiddenPublicFields ? never : T[K];
};

type _Check = EnsureNoLeakage<PublicPersona>;
// ✅ Compile error if leak exists
```

### E2EE Type Safety

**Problem**: Developer might try to add `targetContent` to E2EE moderation.

**Solution**: Discriminated union.

```typescript
type ModerationQueueItem =
  | { targetType: 'POST'; targetContent: string }
  | { targetType: 'MESSAGE' /* NO targetContent */ };
```

**Result**: Impossible to access E2EE content (compile error).

## Soft Deletes & Legal Holds

### Why Soft Deletes?

**Hard delete** (immediate):
- User appeals → "Sorry, already deleted"
- Mistake recovery → impossible
- Legal hold → violated

**Soft delete** (marked):
```sql
UPDATE personas SET deleted_at = now() WHERE id = 'xyz';
```

**Benefits**:
- Appeals can review original content
- Mistakes can be recovered
- Legal holds prevent auto-purge

**Auto-purge**: Cron job deletes records where `deleted_at < (now() - interval '90 days')` AND `legal_hold = false`.

## Operational Controls

### System Configuration

**Use case**: Emergency mode activation.

```sql
UPDATE system_config 
SET value = '{"enabled": true, "reason": "Coordinated spam attack"}'
WHERE key = 'moderation.emergency_mode';
```

**Backend reads config**:
```typescript
if (config.get('moderation.emergency_mode').enabled) {
  // Auto-approve nothing, queue everything
}
```

**No code deploy needed.**

### State Locks

**Use case**: E2EE enable/revoke transitions.

```sql
UPDATE spaces SET state_lock = true WHERE id = 'space-123';
-- Perform dangerous operation (rotate keys, change encryption)
UPDATE spaces SET state_lock = false WHERE id = 'space-123';
```

**Application layer**:
```typescript
if (space.state_lock) {
  throw new Error('SPACE_STATE_LOCKED');
}
```

**Prevents**: Race conditions, partial encryption states.

## Failure Modes Addressed

| Failure Mode | Prevention |
|---|---|
| Internal ID leak | Type system + build failure |
| E2EE content moderation | Separated tables + discriminated unions |
| Duplicate moderation | Idempotency keys |
| Race during E2EE transition | State locks |
| Email breach | Encrypted + hashed split |
| Moderator error | Dry-run mode |
| Accidental hard delete | Soft deletes |
| Legal discovery overreach | Minimal data in each table |
| Crypto downgrade | Immutability enforcement |
| Silent consent | Provable consent records |

## Performance Considerations

### Indexes

All high-volume queries have indexes:
- `personas(accountability_profile_id)`
- `public_content(moderation_status)`
- `events(processed)`
- `rate_limits(persona_id, scope)`

### Query Patterns

**Avoid**:
```sql
-- Never query by email_encrypted (slow, unsafe)
SELECT * FROM auth_profiles WHERE email_encrypted = ...;
```

**Correct**:
```sql
-- Always query by email_hash (fast, safe)
SELECT * FROM auth_profiles WHERE email_hash = $1;
```

### Event Processing

Events are processed by background workers (not request threads):
- Moderation: Critical priority
- Analytics: Low priority
- Notifications: Medium priority

## Deployment Architecture (Future)

```
Production:
  - Next.js (Vercel)
  - NestJS (Fly.io / Railway)
  - PostgreSQL (Supabase)
  - Redis (Upstash)
  - Cloudflare (Edge)

Staging:
  - Same stack
  - Separate database
  - Test E2EE flows

Local Development:
  - Docker Compose
  - Local Postgres
  - Mock Firebase
```

## Version

**Architecture Version**: 1.0  
**Schema Version**: 1  
**Last Updated**: 2026-01-10
