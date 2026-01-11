# User Reporting System Specification v1.0

**Status**: Planning  
**Phase**: Execution Phase 1  
**Purpose**: Allow users to flag content for Trust & Safety review

## Design Principles

1. **Community-Driven** - Users flag problematic content
2. **No Automation** - Reports create moderation signals, not auto-actions
3. **Abuse Prevention** - Track reporter patterns (spam reports)
4. **Privacy-Preserving** - Reporter identity hidden from target
5. **Audit Trail** - All reports logged to `moderation_signals`

---

## Schema Usage

Uses existing `moderation_signals` table from frozen schema:

```sql
CREATE TABLE moderation_signals (
  id UUID PRIMARY KEY,
  target_id UUID NOT NULL,  -- post_id or persona_id
  target_type TEXT CHECK (target_type IN ('POST', 'PERSONA')),
  reporter_accountability_id UUID,  -- Who reported (can be NULL for system-generated)
  signal_type TEXT CHECK (signal_type IN ('USER_REPORT', 'AUTO_FLAG', 'SYSTEM_ALERT')),
  reason_category TEXT,  -- 'SPAM', 'HARASSMENT', 'HATE_SPEECH', etc.
  reason_detail TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Phase 1 Focus**:
- `signal_type = 'USER_REPORT'` only (no auto-flags yet)
- `reason_category` from predefined list
- Links to `moderation_logs` when reviewed

---

## Report Categories

```typescript
enum ReportCategory {
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  HATE_SPEECH = 'HATE_SPEECH',
  MISINFORMATION = 'MISINFORMATION',
  VIOLENCE = 'VIOLENCE',
  SEXUAL_CONTENT = 'SEXUAL_CONTENT',
  OTHER = 'OTHER',
}
```

---

## Core Operations

### 1. Submit Report (User Action)

**Input**:
```typescript
{
  targetId: string;        // post_id or persona_id
  targetType: 'POST' | 'PERSONA';
  category: ReportCategory;
  detail?: string;         // Optional user explanation
  reporterId: string;      // From session (accountability ID)
}
```

**Flow**:
1. Verify reporter is authenticated
2. Check if reporter has already reported this target (prevent spam)
3. Create moderation signal
4. Return confirmation (NOT the signal ID - privacy)

**Output**:
```typescript
{
  submitted: true;
  message: string;  // "Report submitted for review"
  correlationId: string;
}
```

### 2. List User's Reports (My Reports)

**Input**:
```typescript
{
  reporterId: string;  // From session
  limit?: number;
  cursor?: string;
}
```

**Output**:
```typescript
{
  reports: Array<{
    id: string;
    targetType: 'POST' | 'PERSONA';
    category: string;
    status: 'PENDING' | 'REVIEWED';  // From moderation_logs
    submittedAt: string;
  }>;
  nextCursor?: string;
}
```

### 3. Get Reports for Target (Admin Only)

**Input**:
```typescript
{
  targetId: string;
  targetType: 'POST' | 'PERSONA';
}
```

**Output**:
```typescript
{
  reports: Array<{
    id: string;
    category: string;
    detail: string;
    reportCount: number;  // How many users reported same thing
    createdAt: string;
    // NO reporter identity (privacy)
  }>;
}
```

---

## Abuse Prevention

### Spam Reporting Detection

Track reporter patterns:
- Max 10 reports per hour per user
- Max 50 reports per day per user
- Flag accounts that spam reports (moderation signal on reporter)

**Implementation**:
```typescript
// In submit report flow
const recentReports = await moderationSignalRepo.countByReporter(
  reporterId,
  { withinHours: 1 }
);

if (recentReports >= 10) {
  throw new ForbiddenException('REPORT_RATE_LIMIT_EXCEEDED');
}
```

### Duplicate Prevention

```typescript
// Check if already reported
const existing = await moderationSignalRepo.findByReporterAndTarget(
  reporterId,
  targetId
);

if (existing) {
  return {
    submitted: false,
    message: 'You have already reported this content',
  };
}
```

---

## Integration with Trust & Safety

### Moderation Queue Enhancement

Enrich existing moderation queue with report count:

```typescript
// In ModerationService.getModerationQueue()
const posts = await publicContentRepo.findPublicFeed(...);

const enriched = await Promise.all(posts.map(async (post) => {
  const reportCount = await moderationSignalRepo.countByTarget(
    post.id,
    'POST'
  );
  
  return {
    ...post,
    reportCount,  // NEW: How many users reported this
    hasReports: reportCount > 0,
  };
}));
```

### Review Action Updates

When admin reviews a report:
```typescript
// In ModerationService.moderatePost()
// 1. Take moderation action (approve/reject/flag)
const moderationLog = await moderationLogRepo.create({...});

// 2. Mark all reports for this target as reviewed
await moderationSignalRepo.markReviewed(targetId, moderationLog.id);
```

---

## API Endpoints

### Public Endpoints (Authenticated Users)

```
POST   /reports
       → Submit report

GET    /users/me/reports
       → List user's reports
```

### Internal Admin Endpoints

```
GET    /internal/moderation/reports/:targetId
       → Get all reports for target (admin only)

GET    /internal/moderation/signals
       → List all moderation signals (admin dashboard)
```

---

## Request/Response Examples

### Submit Report

**Request**:
```json
POST /reports
{
  "targetId": "uuid-of-post",
  "targetType": "POST",
  "category": "HARASSMENT",
  "detail": "This post contains targeted harassment"
}
```

**Response**:
```json
{
  "submitted": true,
  "message": "Report submitted for review",
  "correlationId": "uuid"
}
```

**Errors**:
- `429 REPORT_RATE_LIMIT_EXCEEDED` - Too many reports
- `409 ALREADY_REPORTED` - Duplicate report
- `404 TARGET_NOT_FOUND` - Invalid target

### List My Reports

**Request**:
```
GET /users/me/reports?limit=20
```

**Response**:
```json
{
  "reports": [
    {
      "id": "uuid",
      "targetType": "POST",
      "category": "SPAM",
      "status": "PENDING",
      "submittedAt": "2026-01-11T..."
    }
  ],
  "correlationId": "uuid"
}
```

### Admin: Get Reports for Target

**Request**:
```
GET /internal/moderation/reports/uuid-of-post
```

**Response**:
```json
{
  "target": {
    "id": "uuid",
    "type": "POST"
  },
  "reports": [
    {
      "id": "uuid",
      "category": "HARASSMENT",
      "detail": "User explanation...",
      "createdAt": "2026-01-11T..."
    }
  ],
  "totalReportCount": 3,
  "correlationId": "uuid"
}
```

---

## Implementation Structure

```
backend/src/reporting/
├── repositories/
│   └── moderation-signal.repository.ts
├── services/
│   └── reporting.service.ts
├── controllers/
│   ├── user-report.controller.ts
│   └── admin-report.controller.ts (extends moderation module)
└── reporting.module.ts
```

---

## Repository Interface

```typescript
interface IModerationSignalRepository {
  create(data: {
    targetId: string;
    targetType: 'POST' | 'PERSONA';
    reporterAccountabilityId: string;
    signalType: 'USER_REPORT';
    reasonCategory: string;
    reasonDetail?: string;
  }): Promise<ModerationSignal>;
  
  findByReporterAndTarget(
    reporterId: string,
    targetId: string
  ): Promise<ModerationSignal | null>;
  
  countByReporter(
    reporterId: string,
    options: { withinHours: number }
  ): Promise<number>;
  
  countByTarget(
    targetId: string,
    targetType: string
  ): Promise<number>;
  
  findByReporter(
    reporterId: string,
    options: { limit: number; cursor?: Date }
  ): Promise<ModerationSignal[]>;
  
  findByTarget(
    targetId: string,
    targetType: string
  ): Promise<ModerationSignal[]>;
  
  markReviewed(
    targetId: string,
    moderationLogId: string
  ): Promise<void>;
}
```

---

## Success Criteria

User Reporting is complete when:

1. ✅ Users can report posts
2. ✅ Users can report personas
3. ✅ Users can view their own reports
4. ✅ Duplicate reporting prevented
5. ✅ Spam reporting rate-limited
6. ✅ Admins see report counts in moderation queue
7. ✅ Admins can view all reports for a target
8. ✅ Reporter identity hidden (privacy)
9. ✅ No automated enforcement (signals only)

---

## Future Enhancements (Phase 2)

- Auto-flag signals (ML-generated)
- System alerts (pattern detection)
- Reporter reputation scoring
- Appeal reporting (false reports)
- Report analytics dashboard

---

**Version**: 1.0  
**Status**: Ready for implementation  
**Dependencies**: `moderation_signals` table (exists in frozen schema)
