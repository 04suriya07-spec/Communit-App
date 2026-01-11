# Phase 1 Beta Launch Plan

**Type**: Invite-Only Behavioral Validation Experiment  
**NOT**: Public launch or marketing event  
**Target**: 500-1,000 users over 4-8 weeks  
**Goal**: Validate human behavior under our rules

---

## Mission Statement

**We are testing whether the system works with real humans, not whether we can grow fast.**

Success = Clean behavioral data + sustainable moderation + validated assumptions  
Failure = Rushing to features before understanding baseline behavior

---

## Beta Constraints (Non-Negotiable)

1. **Invite-only** - No public signups, no waitlist virality
2. **No press** - No announcements, no blog posts, no social media
3. **No growth loops** - No referrals, no gamification, no viral mechanics
4. **Clear labeling** - "BETA / EXPERIMENTAL" on all pages
5. **No promises** - Don't commit to features, timelines, or roadmap

**This is a research lab, not a product launch.**

---

## What We're Actually Measuring

### ❌ What We're NOT Measuring (Ignore These)

- Total users
- Growth rate
- Viral coefficient
- Social shares
- Press mentions
- Vanity metrics

### ✅ What We ARE Measuring (Only These Matter)

**Behavior Signals**:
- **Persona creation**: % who create >1 persona
- **Persona rotation**: Average days before first rotation
- **Posts per user**: Median (not average) post count
- **Time to first post**: Hours after registration
- **Session duration**: Median time on platform

**Safety Signals**:
- **Report rate**: Reports per 1,000 posts
- **Moderation actions**: Admin actions per day
- **Queue growth**: Pending items over time
- **Resolution time**: Minutes from report → decision
- **Appeal rate**: % of moderated posts appealed
- **Appeal success**: % of appeals approved (target: <10%)

**Understanding Signals**:
- **Confusion points**: Where do users drop off?
- **"Why was I moderated?"** questions per 100 users
- **Persona creation abandonment**: % who start but don't finish
- **Post after moderation**: % who post again after being moderated

**Target Baselines (Week 4)**:
- Persona creation: >50% create 2+ personas
- Report rate: <5 reports per 1,000 posts
- Moderation queue: <2hr average resolution
- Appeal success: <10% (indicates good moderation quality)
- Retention: >40% return after 7 days

---

## Rollout Phases

### Phase 0: Staging Validation (Week 1)

**Tasks**:
1. Deploy to staging environment
2. Run full [`staging-verification.md`](file:///s:/Community-App/docs/staging-verification.md) checklist
3. Fix critical bugs
4. Verify monitoring dashboards working

**Gate**: All staging tests pass, no critical issues

---

### Phase 1: Internal Dry Run (Week 2)

**Users**: 50 internal (team, friends, trusted advisors)

**Purpose**:
- Stress test infrastructure
- Find UX confusion before real users
- Validate moderation workflow
- Establish baseline metrics

**Daily tasks**:
- Monitor error logs every 4 hours
- Review moderation queue twice per day
- Document every confusion point
- Fix only critical bugs (no features)

**Success criteria**:
- Zero downtime
- <10 unresolved confusion points
- Moderation sustainable at this scale
- No privacy violations

**Gate**: 7 days of stable operation, team approves

---

### Phase 2: Controlled Beta (Weeks 3-4)

**Users**: Expand to 200 total (150 new invites)

**Invite strategy**:
- Personal invites only (no bulk email)
- Diverse demographics (age, background, tech-savviness)
- Mix of: privacy-conscious, social media active, lurkers
- No influencers, no press, no investors

**Monitoring**:
- Daily dashboard review (first 7 days)
- Weekly metrics summary
- Bi-weekly moderation review meeting

**What we're watching**:
- Do metrics stay stable or improve?
- Does moderation scale linearly?
- What abuse patterns emerge?
- Where do users hesitate?

**Gate**: Metrics stable for 14 days, moderation sustainable

---

### Phase 3: Beta Expansion (Weeks 5-8)

**Users**: Expand to 500-1,000 total

**Pace**: +100-200 users per week (controlled growth)

**Focus**:
- Watch for inflection points (where does moderation break?)
- Identify feature gaps (what do users ask for?)
- Measure retention (who stays, who leaves, why?)
- Refine UX copy and flows

**Red flags** (pause invites immediately):
- Moderation queue >100 items
- Error rate >1%
- Appeal rate >15%
- Privacy violation detected
- Session hijacking successful

**Success**: 30 days of stable operation at 500+ users

---

## What to Build During Beta

### ✅ Allowed (Bug Fixes & Clarity)

- Fix crashes, errors, broken flows
- Improve error messages
- Add explanatory tooltips
- Clarify moderation reasons
- Refine onboarding copy
- Improve moderation dashboard UX
- Add safety tooling for admins

### ❌ Forbidden (New Features)

- NO threaded replies
- NO media uploads
- NO reactions/likes
- NO notifications
- NO communities
- NO private messaging
- NO analytics dashboards for users
- NO gamification elements

**Why?** Each feature changes behavior. We need baseline first.

---

## Decision Framework: When to Advance to Phase 2

**Advance only when ALL 3 are true**:

1. **Moderation is predictable**
   - Linear growth (not exponential)
   - <2hr average resolution time
   - <10% appeal success rate
   - Moderator bandwidth <80% capacity

2. **Users understand the system**
   - <5% confusion drop-offs
   - >50% create multiple personas
   - Persona rotation happens organically
   - Post-moderation retention >60%

3. **Abuse is controlled**
   - Report rate stable or declining
   - No new attack vectors discovered
   - Rate limiting effective
   - Session security holds

**If all 3 hold for 30 consecutive days → Green light Phase 2**

If not → Keep iterating on clarity and tooling, don't add features.

---

## Communication Strategy

### To Beta Users

**Onboarding email**:
> "Welcome to the Community App beta. This is an experimental platform focused on anonymous expression with accountability. We're testing how the system works with real humans, so expect bugs, changes, and occasional moderation learning curves. Your feedback is critical—not for features, but for understanding where the experience is confusing or unclear."

**Weekly update** (optional):
- Share high-level metrics (no individual data)
- Acknowledge issues being fixed
- Thank for patience
- NO feature promises

### To Team

**Daily standup focus**:
- What broke?
- What confused users?
- Moderation capacity today?
- Any abuse patterns?

**Weekly review**:
- Metrics trend (up/down/stable?)
- Top 3 user pain points
- Top 3 moderation challenges
- Decision: continue, pivot, or pause?

### To Investors/Advisors

**Monthly summary only**:
- Users: [count]
- Behavior: [persona creation %, rotation frequency]
- Safety: [moderation load, abuse rate]
- Learning: [top 3 insights]
- Next: [decision to advance or iterate]

**NO growth promises, NO timelines, NO feature roadmap**

---

## Exit Criteria: When to Kill the Beta

**Shut down if any of these occur**:

🚨 **Privacy violation** (email leak, ID exposure)  
🚨 **Moderation overwhelmed** (queue >200, resolution >24hr)  
🚨 **Abuse spiral** (report rate >10%, attack success)  
🚨 **Churn >70%** (users leave and never return)  
🚨 **Fundamental misunderstanding** (users don't get personas after 30 days)

**These signal design failure, not execution failure.**

Don't try to "fix" with features. Pause, redesign, restart.

---

## Success Definition (8 Weeks)

**Beta is successful if**:

1. **We understand how people use personas**
   - Do they rotate? Why/when?
   - Do they abuse anonymity? How?
   - Do they feel safe? Where do they hesitate?

2. **Moderation is sustainable**
   - Linear scaling (not exponential)
   - Moderators aren't burned out
   - False positive rate acceptable
   - Users understand moderation decisions

3. **System holds under abuse**
   - Rate limiting works
   - Session security intact
   - Report spam prevented
   - No privacy violations

**If all 3 are true → Phase 2 is justified**

**If not → We saved 6 months of wrong building**

---

## Next Steps After Beta

**If successful, Phase 2 focus** (in priority order):

1. **Threaded replies** - Make conversations work
2. **Gen-AI moderation assist** - Reduce human load
3. **Basic reactions** - Non-gamified engagement
4. **Media uploads** - If text engagement strong

**Communities and E2EE come later** - only after we trust engagement patterns.

---

**Status**: Ready to execute  
**Timeline**: Week 1 (staging) → Week 2 (internal) → Weeks 3-8 (controlled beta)  
**Decision authority**: Founder (no feature additions without data justification)

**Remember**: This is not about growth. This is about learning before we multiply.
