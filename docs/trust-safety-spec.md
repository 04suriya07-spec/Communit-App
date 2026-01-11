# Trust & Safety Internal APIs Specification v1.0

**Status**: Planning  
**Phase**: Execution Phase 1  
**Audience**: Internal admins/moderators only

## Purpose

Provide internal tools for moderators to:
1. View user accountability profiles and abuse scores
2. Manage trust levels manually (NEW → REGULAR → TRUSTED)
3. Review public content for policy violations
4. Track moderation actions and decisions

**Phase 1 Constraints**:
- ❌ No AI moderation
- ❌ No automation/enforcement
- ❌ No public user access
- ✅ Manual review tools only
- ✅ Read-only for most operations
- ✅ Explicit admin actions for trust level changes

---

## Design Principles

1. **Internal Only** - Never expose these APIs publicly
2. **Read-Heavy** - Most operations are viewing data
3. **Audit Trail** - All actions logged to `moderation_logs`
4. **No Automation** - Human-in-the-loop for all decisions
5. **Privacy Separation** - Cannot view E2EE content (metadata only)

---

## Schema Usage

### Existing Tables (No Changes)

**accountability_profiles**:
```sql
- id (internal only)
- auth_profile_id
- global_abuse_score (0.0 - 1.0)
- risk_level (LOW, MEDIUM, HIGH)
- is_verified
- created_at
```

**trust_levels**:
```sql
- id
- persona_id
- level (NEW, REGULAR, TRUSTED)
- granted_at
```

**public_content**:
```sql
- id
- persona_id
- body
- is_moderated
- moderation_status (PENDING, APPROVED, REJECTED)
- deleted_at
- created_at
```

**internal_admins**:
```sql
- id
- email
- role (MODERATOR, ADMIN, SUPER_ADMIN)
- is_active
- created_at
```

**moderation_logs**:
```sql
- id
- target_id (post/persona/space)
- target_type
- moderator_id
- action (APPROVED, REJECTED, FLAGGED, TRUST_PROMOTED, etc.)
- reason
- explanation_log (human-readable rationale)
- is_dry_run (for training)
- origin_event_id (causality tracking)
- legal_hold
- retention_until
- created_at
```

---

## Core Operations

### 1. View Accountability Profile

**Purpose**: See user's internal accountability data

**Input**:
```typescript
{
  accountabilityProfileId: string;
}
```

**Output**:
```typescript
{
  id: string;
  globalAbuseScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  isVerified: boolean;
  createdAt: string;
  personas: Array<{
    id: string;
    displayName: string;
    isActive: boolean;
    trustLevel: 'NEW' | 'REGULAR' | 'TRUSTED';
    createdAt: string;
  }>;
  recentPosts: Array<{
    id: string;
    body: string; // First 200 chars
    personaDisplayName: string;
    createdAt: string;
  }>;
  moderationHistory: Array<{
    action: string;
    reason: string;
    moderatorEmail: string;
    createdAt: string;
  }>;
}
```

**Security**:
- ⚠️ Internal admin authentication required
- ⚠️ Never expose `auth_profile_id` or email
- ⚠️ Log all views for audit

### 2. Update Trust Level

**Purpose**: Manually promote/demote persona trust level

**Input**:
```typescript
{
  personaId: string;
  newLevel: 'NEW' | 'REGULAR' | 'TRUSTED';
  reason: string; // Required human explanation
  moderatorId: string; // From session
}
```

**Flow**:
1. Verify moderator has permission (role check)
2. Get current trust level
3. Create new trust level record (history tracking)
4. Log action to `moderation_logs`
5. Return confirmation

**Output**:
```typescript
{
  personaId: string;
  oldLevel: 'NEW' | 'REGULAR' | 'TRUSTED';
  newLevel: 'NEW' | 'REGULAR' | 'TRUSTED';
  updatedAt: string;
  moderationLogId: string;
}
```

### 3. Update Abuse Score

**Purpose**: Manually adjust user's abuse score based on pattern review

**Input**:
```typescript
{
  accountabilityProfileId: string;
  newScore: number; // 0.0 - 1.0
  reason: string;
  moderatorId: string;
}
```

**Flow**:
1. Verify moderator is ADMIN or SUPER_ADMIN (not basic moderator)
2. Update `global_abuse_score`
3. Auto-adjust `risk_level` if thresholds crossed:
   - LOW: score < 0.3
   - MEDIUM: 0.3 <= score < 0.7
   - HIGH: score >= 0.7
4. Log to `moderation_logs`

**Output**:
```typescript
{
  accountabilityProfileId: string;
  oldScore: number;
  newScore: number;
  oldRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  newRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  updatedAt: string;
}
```

### 4. Review Public Content (Moderation Queue)

**Purpose**: Get list of posts requiring review

**Input**:
```typescript
{
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  limit?: number;
  cursor?: string;
}
```

**Output**:
```typescript
{
  posts: Array<{
    id: string;
    body: string;
    author: {
      personaId: string;
      displayName: string;
      trustLevel: 'NEW' | 'REGULAR' | 'TRUSTED';
      accountabilityRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; // Internal context
    };
    moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
  }>;
  nextCursor?: string;
}
```

**Note**: Phase 1 auto-approves all posts, so this is primarily for retroactive review.

### 5. Moderate Post (Manual Action)

**Purpose**: Take action on a post (approve/reject/flag)

**Input**:
```typescript
{
  postId: string;
  action: 'APPROVE' | 'REJECT' | 'FLAG';
  reason: string;
  explanationLog: string; // Human-readable rationale
  moderatorId: string;
}
```

**Flow**:
1. Verify moderator authentication
2. Get post and author persona
3. Update `moderation_status` in `public_content`
4. If REJECT: soft delete post
5. Log to `moderation_logs` with full context
6. Return confirmation

**Output**:
```typescript
{
  postId: string;
  action: string;
  moderationLogId: string;
  actedAt: string;
}
```

### 6. List Internal Admins

**Purpose**: View list of moderators/admins

**Input**:
```typescript
{
  role?: 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
  isActive?: boolean;
}
```

**Output**:
```typescript
{
  admins: Array<{
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  }>;
}
```

### 7. View Moderation History

**Purpose**: Audit trail of all moderation actions

**Input**:
```typescript
{
  targetId?: string; // Filter by specific target
  targetType?: 'POST' | 'PERSONA' | 'SPACE';
  moderatorId?: string; // Filter by moderator
  limit?: number;
  cursor?: string;
}
```

**Output**:
```typescript
{
  logs: Array<{
    id: string;
    targetId: string;
    targetType: string;
    action: string;
    reason: string;
    explanationLog: string;
    moderator: {
      id: string;
      email: string;
    };
    isDryRun: boolean;
    createdAt: string;
  }>;
  nextCursor?: string;
}
```

---

## API Endpoints

### Internal Admin Endpoints (Authentication Required)

**Base Path**: `/internal/moderation`

```
GET    /internal/moderation/accountability/:id
       → View accountability profile

POST   /internal/moderation/trust-level
       → Update persona trust level

POST   /internal/moderation/abuse-score
       → Update user abuse score

GET    /internal/moderation/queue
       → Get posts requiring review

POST   /internal/moderation/posts/:id/action
       → Take action on post (approve/reject/flag)

GET    /internal/moderation/admins
       → List internal admins

GET    /internal/moderation/logs
       → View moderation history
```

---

## Security Rules

### 1. Authentication & Authorization

**Admin Session Required**:
```typescript
// Verify admin authentication
if (!session.isAdmin || !session.adminId) {
  throw new UnauthorizedException('ADMIN_ACCESS_REQUIRED');
}
```

**Role-Based Access**:
```typescript
// Only ADMIN+ can modify abuse scores
if (session.adminRole !== 'ADMIN' && session.adminRole !== 'SUPER_ADMIN') {
  throw new ForbiddenException('INSUFFICIENT_PERMISSIONS');
}
```

### 2. Audit Logging

**Every action must be logged**:
```typescript
await moderationLogsRepo.create({
  targetId,
  targetType,
  moderatorId: session.adminId,
  action,
  reason,
  explanationLog,
});
```

### 3. No Public Exposure

**These APIs MUST NOT be accessible to**:
- Regular users
- Public internet
- Frontend applications (except admin dashboards)

**Use separate authentication**:
- Admin-only JWT tokens
- Separate admin session management
- IP whitelisting (optional but recommended)

### 4. Privacy Separation

**Cannot access**:
- E2EE encrypted content (only metadata)
- Private space content (Phase 1: not implemented yet)
- User emails (only accountability data)

**Can access**:
- Public content
- Accountability profiles (internal IDs)
- Trust levels
- Moderation history

---

## Implementation Structure

```
backend/src/moderation/
├── controllers/
│   ├── accountability.controller.ts
│   ├── moderation-queue.controller.ts
│   └── admin.controller.ts
├── services/
│   ├── moderation.service.ts
│   └── audit.service.ts
├── repositories/
│   ├── moderation-log.repository.ts
│   └── internal-admin.repository.ts
├── guards/
│   └── admin-auth.guard.ts
└── moderation.module.ts
```

### Repository Interfaces

```typescript
interface IModerationLogRepository {
  create(data: ModerationLogData): Promise<ModerationLog>;
  findById(id: string): Promise<ModerationLog | null>;
  findByTarget(targetId: string, targetType: string): Promise<ModerationLog[]>;
  findByModerator(moderatorId: string): Promise<ModerationLog[]>;
  findRecent(limit: number): Promise<ModerationLog[]>;
}

interface IInternalAdminRepository {
  findById(id: string): Promise<InternalAdmin | null>;
  findByEmail(email: string): Promise<InternalAdmin | null>;
  findAll(filters?: { role?: string; isActive?: boolean }): Promise<InternalAdmin[]>;
}
```

---

## Phase 1 Constraints

**What Trust & Safety DOES**:
- View accountability profiles
- Manually update trust levels
- Manually update abuse scores
- Review public content
- Take moderation actions (approve/reject/flag)
- View moderation history

**What Trust & Safety DOES NOT DO** (Future Phases):
- AI/ML moderation (all manual)
- Automated enforcement (no auto-bans)
- Pattern detection (manual review only)
- Real-time alerts (queue-based)
- Report handling (no user-generated reports yet)
- Appeal workflows (future phase)

---

## Success Criteria

Trust & Safety APIs are complete when:

1. ✅ Admins can view accountability profiles with full context
2. ✅ Admins can manually promote/demote trust levels
3. ✅ Admins can manually adjust abuse scores
4. ✅ Admins can review posts in moderation queue
5. ✅ Admins can approve/reject/flag posts
6. ✅ All actions logged to `moderation_logs`
7. ✅ Admin authentication enforced
8. ✅ Role-based access control (MODERATOR vs ADMIN)
9. ✅ No public user access to these APIs

**Non-goals for Phase 1**:
- AI moderation (future)
- Automated enforcement (future)
- User-generated reports (future)
- Appeal workflows (future)

---

## Next Steps After Trust & Safety

1. **Manual verification**: Test admin workflows with Postman
2. **Policy Engine v1**: Replace hardcoded limits in Identity + Post services
3. **User Reports**: Allow users to submit reports (connects to moderation queue)
4. **Community Spaces**: Implement group-based posting with moderation policies

**Version**: 1.0  
**Status**: Ready for implementation  
**Frozen Dependencies**: `moderation_logs`, `accountability_profiles`, `internal_admins` tables
