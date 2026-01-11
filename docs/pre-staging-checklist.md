# Pre-Staging Launch Checklist

**Purpose**: Final trust & hygiene checks before staging deployment  
**Timing**: Run these BEFORE first staging deploy  
**Owner**: Technical lead + Founder

---

## ✅ Architecture & Security (COMPLETE)

- [x] Core services implemented (Identity, Posting, Moderation, Policy, Reporting)
- [x] Security hardening (AES-256, Redis sessions, rate limiting, input sanitization)
- [x] Observability complete (logs, metrics, health checks)
- [x] Infrastructure ready (Docker, CI/CD, monitoring)
- [x] Security audit passed (Grade A, 98/100)
- [x] Launch discipline documented
- [x] Beta plan defined
- [x] Exit criteria defined

---

## 🔍 Last-Mile Trust Checks (DO THESE NOW)

### 1️⃣ Logging Hygiene Check (10 minutes, CRITICAL)

**Search logs for these patterns**:
```bash
# In development mode, trigger errors and check logs for:
grep -r "request body" logs/
grep -r "headers" logs/
grep -r "error dump" logs/
grep -r "post content" logs/
grep -r "display name" logs/
```

**Confirm NO logs include**:
- ❌ Post content (body text)
- ❌ Persona display names
- ❌ E2EE metadata payloads (beyond size/IDs)
- ❌ Email addresses (encrypted or plaintext)
- ❌ Session tokens
- ❌ Raw request bodies

**What's SAFE to log**:
- ✅ Correlation IDs
- ✅ Internal UUIDs (persona ID, accountability ID)
- ✅ Endpoint names
- ✅ HTTP status codes
- ✅ Error types (not full stack traces with data)

**If you find anything questionable**:
1. Redact immediately in LoggerService
2. Rebuild
3. Re-test
4. Deploy

**Logging is the #1 place privacy leaks happen accidentally.**

---

### 2️⃣ Moderation "Worst Day" Drill (15 minutes)

**In staging environment**:

**Setup**:
1. Create 10 fake reports at once (simulate report spam)
2. Push them through moderation queue
3. Have moderator process them

**Verify**:
- [ ] Queue ordering makes sense (FIFO or priority-based?)
- [ ] Dry-run mode clearly marked (if testing moderation actions)
- [ ] Explanation logs readable by humans
- [ ] Appeals don't auto-approve or auto-deny
- [ ] Moderator can handle 10 items in <20 minutes
- [ ] No confusion about "why is this in my queue?"

**If a moderator hesitates → UX issue, not user issue**

Document hesitation points, don't try to "fix" yet.

---

### 3️⃣ Persona Confusion Smoke Test (5 users, 15 minutes each)

**Ask 5 internal users** (who haven't used the app before):

1. Complete registration
2. Create a persona
3. Post something
4. After 15 minutes, ask: **"What is a persona?"**

**Acceptable answers**:
- "A temporary identity I can use to post"
- "An anonymous profile"
- "A username that's not my real name"

**Problematic answers**:
- "I don't know"
- "My profile?"
- "Like a character?"
- Hesitation or confusion

**If >1 user hesitates or answers incorrectly**:
- ✅ Note it in beta metrics
- ❌ Don't fix yet
- ✅ Log it for beta tracking

**Confusion is expected. You're measuring it, not hiding it.**

---

## 📦 Deployment Readiness

### Production Secrets ✅
- [x] SESSION_SECRET generated (128-char hex)
- [x] ADMIN_SESSION_SECRET generated (128-char hex)
- [x] EMAIL_ENCRYPTION_KEY generated (base64, 32 bytes)

### Environment Configuration ✅
- [x] `.env.example` updated with all required vars
- [x] Staging environment variables prepared
- [ ] Production environment variables prepared (after staging validated)

### Dependencies ✅
- [x] All npm packages installed
- [x] Build successful (`npm run build`)
- [x] No critical security vulnerabilities

---

## 🚀 Staging Deployment Steps

**Follow these IN ORDER**:

1. **Deploy to staging environment**
   ```bash
   # Option A: Railway
   railway environment create staging
   railway up --environment staging
   
   # Option B: Docker locally
   docker-compose -f docker-compose.staging.yml up -d
   ```

2. **Run full staging verification**
   - Follow [`staging-verification.md`](file:///s:/Community-App/docs/staging-verification.md)
   - Complete all 12 verification steps
   - Document issues in `staging-issues.md`

3. **Complete last-mile checks** (this document)
   - Logging hygiene check
   - Moderation drill
   - Persona confusion test

4. **Fix critical issues only**
   - No feature additions
   - Bug fixes and clarity improvements only

5. **Go/No-Go decision**
   - All checks pass → Proceed to internal beta
   - Any critical issues → Fix and re-verify

---

## 🧭 How to Behave During Beta (CRITICAL)

### ✅ DO

- **Watch metrics daily** (use [`beta-metrics-dashboard.md`](file:///s:/Community-App/docs/beta-metrics-dashboard.md))
- **Read explanation logs** (why did moderation happen?)
- **Sit with moderator discomfort** (don't rush to "fix" their challenge)
- **Let friction exist** (friction is data)
- **Let silence exist** (users not posting is data too)
- **Observe ruthlessly** (behavior > opinions)

### ❌ DO NOT

- **Explain the system verbally to users** (let the UX speak for itself)
- **Add "just one small feature"** (locked during beta)
- **Change rules mid-week** (stability is required for valid data)
- **Loosen rate limits** (even if users complain)
- **Patch around confusion with UI hacks** (confusion is data, measure it)

**Your job is to observe, not to rescue.**

Confusion = Data  
Friction = Data  
Silence = Data  

---

## 🚨 PAUSE IMMEDIATELY IF

These are your **exit criteria** (respect them):

1. **Moderation queue grows faster than you can process**
   - Queue >100 items
   - Resolution time >24 hours
   - Moderators at >80% capacity

2. **One abuse pattern repeats successfully**
   - Session hijacking works
   - Rate limiting bypassed
   - Report spam overwhelms
   - Display name injection passes

3. **Users start asking "Is this anonymous really?"**
   - Distrust in privacy guarantees
   - Attempts to link personas
   - Requests for "real names"

4. **Anyone suggests "just temporarily relax X"**
   - Team pressure to weaken security
   - Investor pressure to loosen privacy
   - User pressure to disable moderation

**Pausing is strength, not failure.**

If you pause, it means:
- You discovered a design flaw before scale
- You protected users from a bad experience
- You saved months of wrong building

**That's a win.**

---

## ✅ Final Sign-Off

**Technical Readiness**: ✅ READY  
**Security Posture**: ✅ HARDENED  
**Documentation**: ✅ COMPLETE  
**Beta Guardrails**: ✅ DEFINED  
**Exit Criteria**: ✅ LOCKED

**Decision**: **APPROVED for staging deployment**

**Next action**: Deploy to staging, run verification, complete trust checks.

---

**Signed**: _______________  
**Date**: 2026-01-11  
**Approved by**: _______________

**Status**: Ready to deploy 🚀
