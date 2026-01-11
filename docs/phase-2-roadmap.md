# Phase 2: Features Roadmap

**Status**: Planning  
**Target**: Q1 2026  
**Prerequisites**: Phase 1 deployed and stable

---

## Overview

Phase 2 focuses on **engagement and community features** to increase user retention and platform stickiness. All features build on the existing identity, posting, and moderation infrastructure.

---

## Priority 1: Engagement Features (4-6 weeks)

### 1.1 Threaded Replies

**Goal**: Enable conversations through nested comments on posts

**Schema Changes**:
```sql
-- Add parent_id to public_content (already exists in frozen schema)
-- No changes needed!
```

**Implementation**:
- Modify `PostService.createPost()` to accept optional `parentId`
- Add `getThread(postId)` to fetch parent + all nested replies
- Update feed to show reply counts
- UI: Indent replies, "Show more" pagination for deep threads

**Acceptance Criteria**:
- Users can reply to any post
- Max nesting depth: 5 levels (prevent abuse)
- Replies inherit moderation status of parent
- Reply author must have active persona

**Policy Updates**:
```typescript
{
  reply_max_depth: 5,
  reply_rate_limit_hourly: 50, // Higher than top-level posts
}
```

---

### 1.2 Likes/Reactions

**Goal**: Simple engagement mechanism without comment overhead

**Schema Changes**:
```sql
CREATE TABLE content_reactions (
  id UUID PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public_content(id),
  persona_id UUID NOT NULL REFERENCES personas(id),
  reaction_type TEXT NOT NULL, -- 'LIKE', 'HELPFUL', 'INSIGHTFUL'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(content_id, persona_id) -- One reaction per persona per post
);

CREATE INDEX idx_reactions_content ON content_reactions(content_id);
```

**Implementation**:
- `POST /public/posts/:id/react` - Add/update reaction
- `DELETE /public/posts/:id/react` - Remove reaction
- `GET /public/posts/:id/reactions` - Get reaction counts
- Real-time updates via WebSocket (future)

**Acceptance Criteria**:
- Users can react with one emoji per post
- Reactions are anonymous (no "who reacted" list)
- Reaction counts shown in feed
- Rate limit: 100 reactions/hour

---

### 1.3 Feed Improvements

**Goal**: Algorithmic ranking to surface quality content

**Current State**: Chronological feed (created_at DESC)

**Phase 2 Enhancements**:
1. **Personalized Feed**
   - Track user engagement (posts viewed, time spent)
   - Recommend posts based on interaction patterns
   
2. **Trending Algorithm**
   - Score = (reactions + replies) / age_hours
   - Decay factor: Older posts lose rank
   
3. **Quality Signals**
   - Trust level of author (boost TRUSTED users)
   - Abuse score (demote HIGH risk authors)
   - Reply depth (rich discussions rank higher)

**Implementation**:
```typescript
// feed.service.ts
async getFeed(userId, algorithm: 'chronological' | 'trending' | 'personalized') {
  switch (algorithm) {
    case 'trending':
      return this.getTrendingFeed();
    case 'personalized':
      return this.getPersonalizedFeed(userId);
    default:
      return this.getChronologicalFeed();
  }
}
```

**Acceptance Criteria**:
- Users can toggle feed algorithm (settings)
- Trending: Update scores every 15 minutes
- Personalized: Fallback to trending for new users

---

## Priority 2: Moderation Enhancement (2-3 weeks)

### 2.1 AI Content Classification

**Goal**: Auto-flag problematic content for human review

**Not** automated enforcement - AI assists, humans decide

**Implementation**:
```bash
npm install @google-cloud/language
# or OpenAI Moderation API
```

**Features**:
- Toxicity scoring (0-1 scale)
- Content categories (hate speech, harassment, spam)
- Auto-create moderation signals for high-risk content
- Admin dashboard shows AI confidence scores

**Acceptance Criteria**:
- AI runs asynchronously (never blocks post submission)
- High toxicity (>0.8) → auto-flag for review
- Admins see AI reasoning in moderation queue
- False positive tracking (admin feedback loop)

---

### 2.2 Appeal Workflow

**Goal**: Users can challenge moderation decisions

**Schema Changes**:
```sql
CREATE TABLE moderation_appeals (
  id UUID PRIMARY KEY,
  content_id UUID REFERENCES public_content(id),
  persona_id UUID REFERENCES personas(id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  reviewed_by UUID REFERENCES internal_admins(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);
```

**Flow**:
1. User submits appeal with explanation
2. Admin reviews in queue
3. Admin can overturn decision or uphold
4. User notified of outcome

---

## Priority 3: Community Features (6-8 weeks)

### 3.1 Community Spaces

**Goal**: Topic-based groups for focused discussions

**Schema** (already in frozen schema!):
```sql
-- No changes needed, use existing:
-- - community_spaces
-- - space_memberships
```

**Implementation**:
- `POST /spaces` - Create community space
- `POST /spaces/:id/join` - Join space
- `POST /spaces/:id/posts` - Post in space (scoped feed)
- Space moderation (elect moderators from members)

**Acceptance Criteria**:
- Public and private spaces
- Space-specific policies (post rate limits)
- Space ban/kick functionality

---

### 3.2 User Profiles

**Goal**: Public activity view (privacy-safe)

**What to show**:
- Active personas (no accountability profile)
- Recent public posts (last 100)
- Reaction counts (aggregate only)
- Join date, trust level badge

**What NOT to show**:
- Email, real identity
- Deleted personas or posts
- Admin actions or reports

---

### 3.3 Notifications

**Goal**: Real-time alerts for engagement

**Schema**:
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  persona_id UUID REFERENCES personas(id),
  type TEXT, -- 'REPLY', 'REACTION', 'MENTION'
  content_id UUID REFERENCES public_content(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Implementation**:
- Push to browser (Service Worker)
- WebSocket for real-time updates
- Batch email summaries (daily digest)

---

## Phase 2 Timeline

| Week | Milestone |
|------|-----------|
| 1-2 | Threaded replies backend + frontend |
| 3 | Likes/reactions |
| 4-5 | Feed improvements (trending + personalized) |
| 6 | AI content classification integration |
| 7-8 | Appeal workflow |
| 9-12 | Community spaces MVP |
| 13-14 | User profiles |
| 15-16 | Notifications system |

---

## Success Metrics (Phase 2)

**Engagement**:
- Reply rate: 20% of posts get at least 1 reply
- Reaction rate: 50% of posts get at least 1 reaction
- Average thread depth: 2.5 replies

**Community**:
- Active spaces: 10+ with >50 members each
- Space retention: 40% DAU in joined spaces

**Moderation**:
- AI flagging precision: >80% (true positives)
- Appeal approval rate: <10% (indicates good moderation)

---

## Dependencies & Risks

**Technical Dependencies**:
- WebSocket server (notifications, real-time updates)
- AI API (Google Cloud Language or OpenAI)
- Increased database load (indexing, query optimization)

**Risks**:
- Feed algorithm gaming (users spamming for visibility)
- AI false positives (over-flagging legitimate content)
- Notification spam (need aggressive rate limits)

**Mitigation**:
- Policy updates via PolicyEngine v2
- A/B testing for feed algorithms
- User preference controls (notification settings)

---

**Version**: 2.0 Planning  
**Status**: Awaiting Phase 1 Stability  
**Next Review**: After 1 month of production data
