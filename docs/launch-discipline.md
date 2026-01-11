# Launch Discipline - Community App

**Purpose**: Operational guardrails for controlled first release  
**Status**: LOCKED - Non-negotiable principles  
**Date**: 2026-01-11

---

## The Golden Rule

> **"If something breaks, we disable features — not privacy or safety."**

This is the foundational principle of our launch. Write it down. Make it visible.

---

## What We NEVER Compromise (Under Any Circumstance)

### 1. Privacy Boundaries

**Never**:
- ❌ Weaken email encryption to "debug" issues
- ❌ Log decrypted emails (even in errors)
- ❌ Expose internal IDs in public APIs
- ❌ Link personas to accountability profiles publicly
- ❌ Show reporter identity (even to admins considering appeals)

**If privacy feature breaks**: Disable the feature, not the privacy.

---

### 2. Safety Systems

**Never**:
- ❌ Loosen rate limits because "users complain"
- ❌ Skip moderation to "speed up" posting
- ❌ Disable session fingerprinting to "fix" login issues
- ❌ Remove abuse score tracking to "improve performance"
- ❌ Auto-approve flagged content to "reduce queue"

**If safety feature breaks**: Turn on emergency moderation mode (manual approval for all).

---

### 3. Security Controls

**Never**:
- ❌ Disable CSRF protection for "compatibility"
- ❌ Weaken session timeouts for "convenience"
- ❌ Skip input sanitization to "allow creativity"
- ❌ Remove rate limiting to "handle load"
- ❌ Expose metrics endpoint publicly for "transparency"

**If security feature breaks**: Shut down affected endpoints until fixed.

---

## Launch Day Rules (First 24 Hours)

### What's ON (Always)

✅ **Logging** - Full verbosity, debug mode  
✅ **Monitoring** - All Grafana alerts active  
✅ **Rate Limiting** - Strictest settings  
✅ **Session Security** - Fingerprinting, rotation, expiry  
✅ **Moderation Queue** - All posts reviewed  
✅ **Audit Logging** - Every action tracked

### What's OFF (Keep Disabled)

❌ **Auto-Approval** - Manual review only  
❌ **Relaxed Limits** - Keep restrictive policies  
❌ **Feature Flags** - No experimental features  
❌ **Public Metrics** - Internal dashboards only  
❌ **Batch Operations** - One-at-a-time for observability

### Emergency-Only Toggles

These can be enabled ONLY if system stability is at risk:

⚠️ **Read-Only Mode** - Disable all writes, keep reads  
⚠️ **Emergency Maintenance** - Global disable  
⚠️ **Rate Limit Override** (for specific IPs, logged and time-limited)

---

## Controlled First Release Mindset

**This is NOT about growth. This is about observation.**

### What We're Watching For

**1. Abuse Attempts** (most valuable data)
- Failed login patterns
- Report spam attempts
- Display name injection tries
- Rate limit hits
- Session hijacking attempts

**Log everything. This is gold.**

**2. Moderator Load**
- Time per review
- Queue growth rate
- False positive rate (appeals)
- Burnout signals (too many reviews)

**If queue > 50**: Pause new registrations.

**3. User Hesitation Points**
- Where do they drop off?
- Consent flows confusing?
- Persona creation unclear?
- Posting friction too high?

**Watch session replays. Ask for feedback.**

**4. Privacy Boundary Tests**
- Do users try to link personas?
- Do they ask for "real names"?
- Do they attempt account merges?
- Do they request "who reported me"?

**These are design validation signals.**

---

## Decision Framework

### When Something Goes Wrong

**Step 1: Assess Impact**
- How many users affected?
- Is privacy/safety compromised?
- Is data at risk?

**Step 2: Classify Severity**

**CRITICAL** (Immediate action):
- Privacy leak (emails exposed)
- Session hijacking detected
- Encryption failure
- Unauthorized admin access

→ **Action**: Shut down immediately, investigate offline

**HIGH** (Within 1 hour):
- Rate limiting broken
- Moderation queue overwhelmed
- Authentication broken
- Database performance degraded

→ **Action**: Enable read-only mode, deploy fix

**MEDIUM** (Within 4 hours):
- Posting errors for some users
- Session timeouts too aggressive
- Feed pagination broken
- Metrics not flowing

→ **Action**: Log errors, schedule fix deployment

**LOW** (Next deploy):
- UI polish issues
- Non-critical feature bugs
- Performance optimizations
- Minor UX improvements

→ **Action**: Add to backlog

**Step 3: Never Compromise Core Principles**
- **If fix requires weakening security**: Don't deploy, redesign
- **If fix requires exposing PII**: Don't deploy, find alternative
- **If fix requires disabling safety**: Don't deploy, live with limitation

---

## Incident Response Template

**When something breaks**:

1. **Declare incident** (Slack, email, whatever)
2. **Assess severity** (use framework above)
3. **Take immediate action** (shut down if CRITICAL)
4. **Communicate to users** (honest, transparent)
5. **Root cause analysis** (what failed, why)
6. **Permanent fix** (not workaround)
7. **Update runbook** (prevent recurrence)

**Template Message**:
```
We're experiencing issues with [feature].

To protect your privacy and security, we've temporarily disabled [feature].

We're investigating and will update you within [timeframe].

Your data is safe. No action required from you.
```

**Never**:
- ❌ Blame users
- ❌ Minimize severity
- ❌ Promise unrealistic timelines
- ❌ Hide root cause

---

## Success Metrics (Week 1)

**Not "growth metrics". These.**

### Safety Metrics
- **Abuse attempt rate**: How many tried?
- **Moderation precision**: % of reports that were valid
- **False positive rate**: % of reports that were invalid
- **Queue latency**: Time from post → review

**Target**: <10% false positives, <2min review time

### Privacy Metrics
- **Email encryption integrity**: 100% AES-256-GCM format
- **Session hijacking attempts**: Detected and blocked
- **Internal ID leaks**: Zero
- **Reporter identity exposures**: Zero

**Target**: Zero privacy violations

### Operational Metrics
- **Uptime**: 99.5%+
- **Error rate**: <0.5%
- **P95 latency**: <200ms
- **Memory leaks**: Zero

**Target**: System stability

---

## What "Success" Looks Like (Week 1)

**Not** "1000 users signed up!"

**Success is**:
- ✅ We observed real abuse attempts and our defenses worked
- ✅ Moderators kept up with queue without burnout
- ✅ No privacy violations or security incidents
- ✅ Users understood persona anonymity
- ✅ We learned where users hesitate (design insights)
- ✅ System remained stable under real load
- ✅ We didn't compromise on principles despite pressure

**That's a successful controlled release.**

---

## Red Flags (Abort Launch)

If any of these occur, **pause new registrations immediately**:

🚨 **Privacy violation detected** (email leak, ID exposure)  
🚨 **Session hijacking successful** (fingerprinting failed)  
🚨 **Moderation queue > 100 items** (manual review overwhelmed)  
🚨 **Rate limiting bypassed** (abuse at scale)  
🚨 **Database connection exhaustion** (need pooling)  
🚨 **Memory leak detected** (uptime < 12hrs before OOM)  
🚨 **Encryption failures** (AES errors in logs)

**These are NOT bugs. These are design validation failures.**

Fix offline. Relaunch when ready.

---

## Post-Launch Review (Day 7)

**Questions to answer**:

1. **Abuse Patterns**: What attacks did we see? Did defenses hold?
2. **User Behavior**: How do users actually use personas? Match our assumptions?
3. **Moderation Load**: Sustainable? Need AI assist? Need more moderators?
4. **Performance**: Where are bottlenecks? What needs optimization?
5. **Privacy**: Any near-misses? Any user confusion about anonymity?
6. **Policy Tuning**: Are rate limits right? Trust level thresholds?

**Outcome**: Phase 2 priority stack based on **observed behavior**, not assumptions.

---

## Principles to Remember

**1. Privacy First**
Every decision: "Does this preserve anonymity?"

**2. Safety Always**
Every decision: "Does this keep bad actors out?"

**3. Users Are Learning**
They don't know how personas work yet. Be patient. Watch. Learn.

**4. Moderators Are Human**
Don't overwhelm them. Queue size > 50? Pause growth.

**5. Data Beats Assumptions**
We built what we *think* users need. Now we observe what they *actually* do.

**6. Breaking Things Is Okay**
Weakening security to avoid breaking things is NOT okay.

---

## The North Star

> **"We're building a platform where people can speak freely without fear of being doxxed, harassed, or tracked."**

Every decision should serve this mission.

If a decision weakens privacy, safety, or trust—even to "save" the launch—it's the wrong decision.

---

**Status**: LOCKED  
**Review Cycle**: Never (these are principles, not policies)  
**Next Review**: Only if core mission changes

**Signed**: Platform Team  
**Date**: 2026-01-11

---

**Remember**: Launch discipline is about protecting users from us as much as from bad actors.
