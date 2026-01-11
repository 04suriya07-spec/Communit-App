# Security Policy

## Overview

This platform enforces privacy and safety as **structural guarantees**, not promises. This document outlines our security model, threat assumptions, and reporting procedures.

## Threat Model

### Assumptions

1. **The server is not trusted with E2EE content**
   - E2EE messages are stored as metadata only
   - No plaintext, no keys, no scanning possible
   - Enforcement: Database schema + type system

2. **Internal administrators are not trusted with user plaintext**
   - Admin identity is separate from user personas
   - Moderation actions reference internal IDs, not user identities
   - Enforcement: `internal_admins` table, not `personas`

3. **Databases may be breached**
   - Email is stored as `email_encrypted` + `email_hash` (never plaintext)
   - Identity layers are separated (auth → accountability → persona)
   - Soft deletes prevent immediate hard deletion
   - Enforcement: Table separation, retention policies

4. **Moderation decisions must be auditable**
   - Every action has an `explanation_log` (human-readable)
   - Causality chains: `origin_event_id` links report → event → action
   - Appeals flow with timestamps
   - Enforcement: Audit tables, event bus

5. **Legal requests may occur**
   - Design minimizes data exposure
   - E2EE content is structurally inaccessible
   - Legal holds prevent auto-deletion during investigations
   - Enforcement: `legal_hold` flags, retention policies

## Security Architecture

### Identity Isolation (3-Layer Model)

```
┌─────────────────────────────────────────────┐
│ auth_profiles (Authentication)              │
│ - Restricted access                         │
│ - email_encrypted + email_hash              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ accountability_profiles (Internal)          │
│ - NEVER exposed publicly                    │
│ - Abuse scores, risk levels                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ personas (Public-Facing)                    │
│ - Safe to expose in APIs                    │
│ - No linkage to real identity               │
└─────────────────────────────────────────────┘
```

**Why**: If any single layer is compromised, minimal user data is exposed.

### Privacy-Separated Content Storage

- **Public Content**: `public_content` (unencrypted, moderated)
- **Community Content**: `community_content` (server-encrypted, moderated)
- **E2EE Messages**: `e2ee_metadata` (metadata only, NO plaintext)

**Critical Boundary**: E2EE content cannot be read by the server. This is enforced at:
- Database level (no `body` column in `e2ee_metadata`)
- API level (compile-time type error if plaintext attempted)
- Application level (client-side encryption only)

### State Safety Mechanisms

1. **State Locks**: Prevent race conditions during E2EE enable/revoke
2. **Idempotency Keys**: Prevent duplicate moderation/billing actions
3. **Soft Deletes**: Enable appeals and mistake recovery
4. **Legal Holds**: Prevent auto-deletion during investigations

## API Security

### Public API Guarantees

**These fields MUST NEVER appear in public API responses:**
- `accountabilityProfileId`
- `authProfileId`
- `globalAbuseScore`
- `riskLevel`
- `moderatorId`

**Enforcement**: TypeScript type system causes **build failure** if violated.

### E2EE Guarantees

**E2EE message payloads MUST NEVER contain:**
- `body` (plaintext)
- `targetContent` (for moderation)
- Encryption keys

**Enforcement**: 
- Database schema (no columns exist)
- TypeScript discriminated unions (compile-time error)

## Operational Security

### Idempotency Protection

All async operations (moderation, billing, notifications) require `idempotencyKey`.

**Why**: Prevents duplicate actions during retries, network failures, or race conditions.

### Audit Trails

Every moderation action includes:
- `origin_event_id` (causality chain)
- `explanation_log` (human-readable reasoning)
- `moderator_id` (internal admin, not persona)

**Purpose**: Legal defense, appeals, incident response.

### Dry-Run Mode

Moderators can set `isDryRun: true` to log actions without applying them.

**Purpose**: Training new moderators without risk.

## Rate Limiting

Dual-scope enforcement:
- **Global**: Prevents cross-space spam
- **Space**: Prevents community flooding

**Enforcement**: Database CHECK constraint ensures configuration validity.

## E2EE Consent

E2EE cannot be enabled without **provable consent** from all space members.

**Enforcement**:
- API requires `consentRecordIds[]` (not a boolean checkbox)
- Database stores timestamped `e2ee_consents` records
- Enable flow verifies all `space_members` have matching consents

**Legal benefit**: Explicit evidence for app stores, regulators, disputes.

## Data Retention

- Reports, moderation logs, events: 90-day auto-purge (configurable)
- Legal holds override auto-deletion
- Soft deletes allow recovery before hard deletion

## Non-Goals (Explicit)

This platform **intentionally does not**:
- Scan E2EE content (structurally impossible)
- Provide message previews for E2EE (metadata only)
- Enable retroactive decryption (no backdoors)
- Store plaintext emails (encrypted + hashed only)
- Link personas to real identities in public APIs

## Vulnerability Disclosure

### Reporting

**Email**: security@[yourdomain].com

Please include:
- Vulnerability description
- Steps to reproduce
- Impact assessment
- Suggested fix (if any)

### Response Timeline

- **24 hours**: Initial acknowledgment
- **7 days**: Severity assessment and timeline
- **30 days**: Fix or mitigation (critical issues)
- **90 days**: Public disclosure (coordinated)

### Scope

**In scope**:
- Authentication/authorization bypasses
- Identity linkage attacks
- E2EE implementation flaws
- SQL injection, XSS, CSRF
- Rate limit bypasses
- Privacy boundary violations

**Out of scope**:
- Social engineering
- Physical attacks
- DDoS (handled by Cloudflare)
- Third-party services (Firebase, Stripe, etc.)

### Recognition

We maintain a **Hall of Fame** for responsible disclosures (with permission).

## Compliance Readiness

This architecture is designed to support:
- **GDPR**: Right to deletion (soft deletes), data minimization (separated tables), purpose limitation
- **CCPA**: Data access requests, deletion, no sale of personal data
- **COPPA**: Age verification flow (future), parental consent
- **App Store Reviews**: Provable E2EE consent, no scanning, audit trails

## Security Checklist (Before Launch)

- [ ] Penetration test on identity mapping
- [ ] E2EE implementation audit (libsignal)
- [ ] Database access pattern review
- [ ] API leak prevention test (build with forbidden fields)
- [ ] Subpoena simulation (verify minimal data exposure)
- [ ] Rate limit stress test
- [ ] State lock race condition test
- [ ] Idempotency test (duplicate event handling)

## Version

**Schema Version**: 1.0  
**Last Updated**: 2026-01-10  
**Next Review**: Before public launch
