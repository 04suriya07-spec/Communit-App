# Public Posting Service Specification v1.0

**Status**: Planning  
**Phase**: Execution Phase 1  
**Dependency**: Identity Service (complete)

## Purpose

Enable anonymous public content posting with **persona-scoped authorship** and **accountability linkage**.

**Core Question**: How do we allow anonymity while maintaining accountability?

**Answer**: Personas are public-facing, but linked internally to accountability profiles.

---

## Design Principles

1. **Personas post, not users** - All content is attributed to a persona
2. **Accountability persists** - Abuse scores follow the user, not the persona
3. **Text-only (Phase 1)** - No media, no rich formatting
4. **No moderation yet** - Content is immediately visible (moderation in future phase)
5. **Soft deletes** - Posts can be deleted but remain in DB for appeals/audits

---

## Schema Alignment

Uses existing `public_content` table from frozen schema:

```sql
CREATE TABLE public_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES personas(id),
  body TEXT NOT NULL,
  is_moderated BOOLEAN DEFAULT false,
  moderation_status TEXT CHECK (moderation_status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Phase 1 simplification**:
- `is_moderated = false` (no moderation)
- `moderation_status = 'APPROVED'` (auto-approve)
- `deleted_at` for soft deletes

---

## Core Operations

### 1. Create Post

**Input**:
```typescript
{
  personaId: string;      // From session
  body: string;           // Text content (max 5000 chars)
}
```

**Flow**:
1. Verify persona belongs to current user (via session `accountabilityProfileId`)
2. Verify persona is active (`is_active = true AND deleted_at = null`)
3. Check rate limits (TODO: via Policy Engine - default 10/hour)
4. Create post with `moderation_status = 'APPROVED'` (Phase 1: no moderation)
5. Return post ID + timestamp

**Output**:
```typescript
{
  postId: string;
  createdAt: string;
  correlationId: string;
}
```

### 2. List Posts (Public Feed)

**Input**:
```typescript
{
  limit?: number;         // Default 20, max 100
  cursor?: string;        // Pagination cursor (created_at timestamp)
}
```

**Flow**:
1. Query `public_content` WHERE `deleted_at IS NULL`
2. Order by `created_at DESC`
3. Join with `personas` to get display name (but NOT accountability ID)
4. Return posts with persona info

**Output**:
```typescript
{
  posts: Array<{
    id: string;
    body: string;
    author: {
      personaId: string;
      displayName: string;
      // NO accountabilityProfileId
    };
    createdAt: string;
  }>;
  nextCursor?: string;
  correlationId: string;
}
```

### 3. List User Posts (My Posts)

**Input**:
```typescript
{
  personaId?: string;     // Optional: filter by persona
  limit?: number;
  cursor?: string;
}
```

**Flow**:
1. Get accountability profile ID from session
2. Get all active personas for user
3. Query `public_content` WHERE `persona_id IN (user's personas)`
4. Return posts grouped by persona

**Output**:
```typescript
{
  posts: Array<{
    id: string;
    body: string;
    personaId: string;
    personaDisplayName: string;
    createdAt: string;
  }>;
  nextCursor?: string;
  correlationId: string;
}
```

### 4. Delete Post (Soft Delete)

**Input**:
```typescript
{
  postId: string;
}
```

**Flow**:
1. Verify post belongs to user's persona
2. Set `deleted_at = now()`
3. Post hidden from public feed immediately
4. Hard delete after retention period (90 days)

**Output**:
```typescript
{
  deletedAt: string;
  correlationId: string;
}
```

---

## Security Rules

### 1. Persona Ownership Verification

Before ANY post operation:
```typescript
// Verify persona belongs to current user
const persona = await personaRepo.findById(personaId);
if (persona.accountabilityProfileId !== session.accountabilityProfileId) {
  throw new ForbiddenException('PERSONA_NOT_OWNED');
}
```

### 2. Active Persona Check

```typescript
if (!persona.isActive || persona.deletedAt) {
  throw new ForbiddenException('PERSONA_INACTIVE');
}
```

### 3. No Internal ID Leakage

Public feed MUST NOT include:
- ❌ `accountability_profile_id`
- ❌ `auth_profile_id`
- ❌ `global_abuse_score`
- ❌ `risk_level`

Only expose:
- ✅ `persona_id`
- ✅ `display_name`

### 4. Rate Limiting

**Phase 1 (Hardcoded)**:
- 10 posts per hour per persona
- 30 posts per hour per accountability profile (across all personas)

**Future (Policy Engine)**:
- Trust level modifiers (NEW = 10/hr, REGULAR = 20/hr, TRUSTED = 50/hr)
- Spike detection

---

## API Contracts

### POST /public/posts

**Request**:
```json
{
  "personaId": "uuid",
  "body": "This is my anonymous post"
}
```

**Response**:
```json
{
  "postId": "uuid",
  "createdAt": "2026-01-11T08:00:00Z",
  "correlationId": "uuid"
}
```

**Errors**:
- `403 PERSONA_NOT_OWNED` - Posting as another user's persona
- `403 PERSONA_INACTIVE` - Persona is deactivated/deleted
- `429 RATE_LIMIT_EXCEEDED` - Too many posts
- `400 BODY_TOO_LONG` - Exceeds 5000 chars

### GET /public/posts

**Request**:
```
GET /public/posts?limit=20&cursor=<timestamp>
```

**Response**:
```json
{
  "posts": [
    {
      "id": "uuid",
      "body": "Post content",
      "author": {
        "personaId": "uuid",
        "displayName": "AnonymousUser"
      },
      "createdAt": "2026-01-11T08:00:00Z"
    }
  ],
  "nextCursor": "2026-01-11T07:00:00Z",
  "correlationId": "uuid"
}
```

### GET /users/me/posts

**Request**:
```
GET /users/me/posts?personaId=<uuid>&limit=20
```

**Response**:
```json
{
  "posts": [
    {
      "id": "uuid",
      "body": "My post",
      "personaId": "uuid",
      "personaDisplayName": "MyPersona",
      "createdAt": "2026-01-11T08:00:00Z"
    }
  ],
  "nextCursor": "...",
  "correlationId": "uuid"
}
```

### DELETE /public/posts/:id

**Request**:
```
DELETE /public/posts/<post-id>
```

**Response**:
```json
{
  "deletedAt": "2026-01-11T08:00:00Z",
  "correlationId": "uuid"
}
```

**Errors**:
- `403 POST_NOT_OWNED` - Deleting another user's post
- `404 POST_NOT_FOUND` - Post doesn't exist

---

## Implementation Structure

```
backend/src/posting/
├── controllers/
│   └── public-post.controller.ts
├── services/
│   └── post.service.ts
├── repositories/
│   └── public-content.repository.ts
└── posting.module.ts
```

### Repository

```typescript
interface IPublicContentRepository {
  create(data: {
    personaId: string;
    body: string;
  }): Promise<PublicContent>;
  
  findById(id: string): Promise<PublicContent | null>;
  
  findPublicFeed(params: {
    limit: number;
    cursor?: Date;
  }): Promise<PublicContent[]>;
  
  findByAccountabilityProfile(
    accountabilityProfileId: string,
    personaId?: string
  ): Promise<PublicContent[]>;
  
  softDelete(id: string): Promise<PublicContent>;
}
```

### Service

```typescript
class PostService {
  async createPost(data: {
    personaId: string;
    body: string;
    accountabilityProfileId: string; // From session
  }): Promise<{ postId: string; createdAt: string }>;
  
  async getPublicFeed(params: {
    limit: number;
    cursor?: string;
  }): Promise<{ posts: PublicPost[]; nextCursor?: string }>;
  
  async getUserPosts(params: {
    accountabilityProfileId: string;
    personaId?: string;
    limit: number;
  }): Promise<{ posts: UserPost[] }>;
  
  async deletePost(data: {
    postId: string;
    accountabilityProfileId: string; // Ownership verification
  }): Promise<{ deletedAt: string }>;
}
```

---

## Phase 1 Constraints

**What PostService DOES**:
- Create text-only posts
- List public feed (non-moderated)
- List user's own posts
- Soft delete posts
- Verify persona ownership
- Basic rate limiting (hardcoded)

**What PostService DOES NOT DO** (Future Phases):
- Moderation (all posts auto-approved)
- Media uploads (text only)
- Rich formatting (plain text)
- Reactions/likes
- Comments/replies
- Edit posts (delete + recreate only)
- Search/filtering
- Following/feeds per user

---

## Integration Points

### With IdentityService

```typescript
// Verify persona ownership
const accountability = await identityService.getAccountabilityContext(personaId);
if (accountability.accountabilityProfileId !== session.accountabilityProfileId) {
  throw new ForbiddenException();
}
```

### With PolicyEngine (Future)

```typescript
// Check posting rate limit
const allowed = await policyEngine.evaluate('post_rate_limit', {
  personaId,
  accountabilityProfileId,
  trustLevel,
});
```

### With EventBus (Future)

```typescript
// Emit PostCreated event
await eventBus.emit('PostCreated', {
  postId,
  personaId,
  accountabilityProfileId,
});
```

---

## Success Criteria

PostService is complete when:

1. ✅ Users can create posts via personas
2. ✅ Public feed shows posts (persona names only, no internal IDs)
3. ✅ Users can list their own posts
4. ✅ Users can soft delete posts
5. ✅ Persona ownership is verified for all operations
6. ✅ Inactive personas cannot post
7. ✅ Rate limits enforced (hardcoded Phase 1)
8. ✅ No accountability IDs leak in responses

**Non-goals for Phase 1**:
- Content moderation (future)
- Media uploads (future)
- Reactions/comments (future)
- Policy Engine integration (hardcoded limits for now)

---

## Next Steps After PostService

1. Manual verification tests (similar to Identity Service)
2. Choose next service:
   - Policy Engine (replace hardcoded limits)
   - Trust & Safety Dashboard (internal moderation tools)
   - Community Spaces (group posting)

**Version**: 1.0  
**Status**: Ready for implementation  
**Frozen Dependencies**: `public_content` schema, API contracts
