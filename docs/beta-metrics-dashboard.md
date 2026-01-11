# Beta Metrics Tracking Dashboard

**Purpose**: Track only what matters for behavioral validation  
**Update frequency**: Daily (first 2 weeks), then weekly  
**Owner**: Founder + Lead Moderator

---

## Core Metrics (Track Daily)

### 1. Behavior Signals

| Metric | Target | Current | Trend | Notes |
|--------|--------|---------|-------|-------|
| Users with >1 persona | >50% | ___ | ↑/↓/→ | |
| Avg days to first rotation | <14 | ___ | ↑/↓/→ | |
| Median posts per user | >3 | ___ | ↑/↓/→ | |
| Hours to first post | <4 | ___ | ↑/↓/→ | |
| 7-day retention rate | >40% | ___ | ↑/↓/→ | |

### 2. Safety Signals

| Metric | Target | Current | Trend | Notes |
|--------|--------|---------|-------|-------|
| Reports per 1,000 posts | <5 | ___ | ↑/↓/→ | |
| Moderation queue size | <50 | ___ | ↑/↓/→ | |
| Avg resolution time (min) | <120 | ___ | ↑/↓/→ | |
| Appeal rate | <10% | ___ | ↑/↓/→ | |
| Appeal success rate | <10% | ___ | ↑/↓/→ | |

### 3. Understanding Signals

| Metric | Target | Current | Trend | Notes |
|--------|--------|---------|-------|-------|
| Persona creation abandonment | <20% | ___ | ↑/↓/→ | |
| "Why moderated?" questions | <5/100 | ___ | ↑/↓/→ | |
| Post after moderation | >60% | ___ | ↑/↓/→ | |
| Drop-off points (count) | <10 | ___ | ↑/↓/→ | |

---

## System Health (Monitor Daily)

| Metric | Threshold | Current | Status |
|--------|-----------|---------|--------|
| Uptime % | >99.5% | ___ | 🟢/🟡/🔴 |
| Error rate | <0.5% | ___ | 🟢/🟡/🔴 |
| P95 latency (ms) | <200 | ___ | 🟢/🟡/🔴 |
| Rate limit hits/day | <100 | ___ | 🟢/🟡/🔴 |
| Session hijacking attempts | 0 | ___ | 🟢/🟡/🔴 |

---

## Moderation Load (Track Daily)

| Day | Posts | Reports | Actions | Queue | Moderator Hours | Notes |
|-----|-------|---------|---------|-------|-----------------|-------|
| Day 1 | | | | | | |
| Day 2 | | | | | | |
| Day 3 | | | | | | |
| Day 7 | | | | | | |
| Day 14 | | | | | | |
| Day 30 | | | | | | |

**Key question**: Is moderation load growing linearly with users?

---

## User Behavior Patterns (Weekly Summary)

### Week 1
- **Personas created**: ___
- **Personas rotated**: ___
- **Most common post topics**: ___
- **Peak posting times**: ___
- **Confusion points**: ___

### Week 2
- **Personas created**: ___
- **Personas rotated**: ___
- **Most common post topics**: ___
- **Peak posting times**: ___
- **Confusion points**: ___

*(Repeat for Weeks 3-8)*

---

## Abuse Patterns (Log All Attempts)

| Date | Attack Type | Success? | Mitigation | Notes |
|------|-------------|----------|------------|-------|
| | | | | |

**Categories**:
- Brute force login
- Report spam
- Display name injection
- Session hijacking
- Rate limit bypass
- Identity linking attempts

---

## User Feedback Themes (Qualitative)

### What Users Love
1. ___
2. ___
3. ___

### What Confuses Users
1. ___
2. ___
3. ___

### What Users Ask For (Don't Build Yet)
1. ___
2. ___
3. ___

### Where Users Drop Off
1. ___
2. ___
3. ___

---

## Decision Log

| Date | Metric | Value | Decision | Rationale |
|------|--------|-------|----------|-----------|
| | | | | |

**Examples**:
- "Day 5: Queue >50, paused invites"
- "Week 2: Appeal rate 15%, revised moderation guidelines"
- "Week 4: Metrics stable, expanded to 500 users"

---

## Weekly Review Template

**Week [X] Summary**

**Users**: [Total] (+[New] this week)

**Behavior**:
- Persona creation: [%]
- Rotation frequency: [X days avg]
- Posts per user: [median]

**Safety**:
- Report rate: [per 1K posts]
- Queue size: [max/avg]
- Resolution time: [avg minutes]

**Health**:
- Uptime: [%]
- Error rate: [%]
- Latency P95: [ms]

**Insights**:
- What we learned: ___
- What surprised us: ___
- What to fix: ___

**Decision**: Continue / Pause / Pivot

---

## Go/No-Go Checklist (Week 4)

**Advance to Phase 2 only if ALL are ✅**:

- [ ] Moderation sustainable (queue <2hr, moderators <80% capacity)
- [ ] Users understand system (<5% confusion drop-offs)
- [ ] Abuse controlled (report rate <5 per 1K, no successful attacks)
- [ ] Metrics stable for 14+ consecutive days
- [ ] No red flags (privacy violations, session hijacking, spiral)

**If NO → Keep iterating, don't add features**
**If YES → Green light Phase 2 planning**

---

**Last Updated**: ___  
**Reviewed By**: ___  
**Next Review**: ___
