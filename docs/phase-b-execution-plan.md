# Phase B: Staging Deployment Execution Plan

**Controller**: Platform Reliability Engineer  
**Status**: Pre-Deployment  
**Phase A Approval**: ✅ GRANTED (zero critical issues)  
**Constraints**: Fix crashes/security/corruption ONLY

---

## PHASE B OBJECTIVES

1. Deploy backend to staging environment
2. Execute 12-step verification checklist
3. Run moderation worst-day simulation
4. Document blocking issues only
5. Produce GO/NO-GO for Phase C (internal beta)

**NOT OBJECTIVES**:
- UX improvements
- Performance optimization
- Feature additions
- Schema changes
- API contract changes

---

## DEPLOYMENT STEPS

### Step 1: Environment Preparation

```bash
# Verify environment variables ready
cat .env.staging

# Required vars (DO NOT use production secrets):
NODE_ENV=staging
PORT=3001
DATABASE_URL=<staging_postgres>
REDIS_URL=<staging_redis>
SESSION_SECRET=<staging_session_secret>
ADMIN_SESSION_SECRET=<staging_admin_secret>
EMAIL_ENCRYPTION_KEY=<staging_encryption_key>
CORS_ORIGIN=https://staging.communityapp.com
LOG_LEVEL=debug
```

**STOP CONDITIONS**:
- Missing environment variables
- Production secrets detected in staging
- DATABASE_URL points to production

---

### Step 2: Database Migration

```bash
# Deploy database (Prisma)
cd backend
npx prisma generate
npx prisma db push

# Verify tables created
npx prisma studio
# Check: auth_profiles, personas, public_content, moderation_signals, etc.
```

**SUCCESS CRITERIA**:
- All tables present
- Foreign keys enforced
- Indexes created

**STOP CONDITIONS**:
- Migration fails
- Schema drift detected
- Data corruption

---

### Step 3: Backend Deployment

**Option A: Docker**
```bash
docker-compose -f docker-compose.staging.yml up -d
docker-compose logs -f backend
```

**Option B: Railway**
```bash
railway environment staging
railway up
railway logs
```

**SUCCESS CRITERIA**:
- Backend starts without crashes
- Health endpoint responds (200 OK)
- Logs show "Community App running"

**STOP CONDITIONS**:
- Startup crashes
- Port binding failures
- Environment variable errors

---

### Step 4: Health Verification

```bash
# Liveness
curl https://staging-api.communityapp.com/api/v1/health/live
# Expected: {"status":"alive","timestamp":"..."}

# Readiness
curl https://staging-api.communityapp.com/api/v1/health/ready
# Expected: {"status":"healthy","uptime":N,"checks":{"database":{"status":"healthy"}}}
```

**PASS**: Both return 200 with expected JSON  
**FAIL**: 500 error, database unhealthy, timeout

---

## 12-STEP VERIFICATION CHECKLIST

Execute in order. STOP on any FAIL.

### 1. Registration Flow

```bash
curl -X POST https://staging-api.communityapp.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@staging.com",
    "password": "TestStaging123!",
    "initialDisplayName": "StagingUser"
  }'
```

**PASS**: 201 Created, returns `{"personaId":"...","displayName":"StagingUser"}`  
**FAIL**: 500 error, missing fields, database error

**Database Check**:
```sql
SELECT * FROM auth_profiles WHERE email_hash = encode(digest('test@staging.com', 'sha256'), 'hex');
-- Verify: email_encrypted format is iv:authTag:ciphertext
-- Verify: accountability_profile created
-- Verify: persona created
-- Verify: trust_level = 'NEW'
```

---

### 2. Login Flow

```bash
curl -X POST https://staging-api.communityapp.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@staging.com","password":"TestStaging123!"}'
```

**PASS**: 200 OK, sets session cookie  
**FAIL**: 401, 500, no cookie set

**Redis Check**:
```bash
redis-cli -h <staging-redis>
> KEYS sess:user:*
> GET sess:user:<id>
# Verify session data present
```

---

### 3. Session Fingerprinting

```bash
# Login with User-Agent A
curl -X POST .../auth/login \
  -H "User-Agent: AgentA" \
  -c cookies1.txt \
  -d '{...}'

# Use session with User-Agent B
curl -X GET .../personas \
  -H "User-Agent: AgentB" \
  -b cookies1.txt
```

**PASS**: Second request returns 401 SESSION_INVALID  
**FAIL**: Session accepted despite fingerprint mismatch

---

### 4. Post Creation

```bash
curl -X POST .../public/posts \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"personaId":"<from_step1>","body":"Test post"}'
```

**PASS**: 201 Created  
**FAIL**: 500, validation error, database error

---

### 5. Public Feed

```bash
curl https://staging-api.communityapp.com/api/v1/public/posts
```

**PASS**: 200 OK, returns posts array  
**FAIL**: 500, empty when shouldn't be, wrong schema

---

### 6. Rate Limiting (Auth)

```bash
# Attempt 6 failed logins rapidly
for i in {1..6}; do
  curl -X POST .../auth/login \
    -d '{"email":"fake@test.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n"
done
```

**PASS**: First 5 return 401, 6th returns 429 (rate limited)  
**FAIL**: All succeed, rate limiting not active

---

### 7. Rate Limiting (Content)

```bash
# Attempt 31 posts rapidly (Limit: 30/min)
# (Use script or loop)
```

**PASS**: First 30 succeed, 31st returns 429  
**FAIL**: All succeed, rate limiting not active

---

### 8. Report Submission

```bash
curl -X POST .../reports \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "targetId":"<post_id>",
    "targetType":"POST",
    "category":"SPAM",
    "detail":"Test report"
  }'
```

**PASS**: 200 OK  
**FAIL**: 500, not created in database

**Database Check**:
```sql
SELECT * FROM moderation_signals WHERE target_id = '<post_id>';
-- Verify: reporter_persona_id is NOT null
-- Verify: created_at is recent
```

---

### 9. Duplicate Report Prevention

```bash
# Submit same report twice
curl -X POST .../reports -b cookies.txt -d '{...same target...}'
curl -X POST .../reports -b cookies.txt -d '{...same target...}'
```

**PASS**: Second returns error (duplicate)  
**FAIL**: Both succeed

---

### 10. Email Encryption Integrity

```sql
SELECT email_encrypted, email_hash FROM auth_profiles LIMIT 1;
-- Verify: email_encrypted contains TWO colons (iv:authTag:ciphertext)
-- Verify: email_hash is 64-char hex (SHA-256)
```

**PASS**: Format correct, contains colons  
**FAIL**: Base64 format (old placeholder), no colons, malformed

---

### 11. Correlation IDs

```bash
curl -X POST .../auth/register \
  -H "x-correlation-id: test-correlation-123" \
  -d '{...}'
```

**Check logs**:
```bash
grep "test-correlation-123" logs/combined.log
```

**PASS**: Correlation ID appears in logs  
**FAIL**: Not found in logs

---

### 12. Metrics Endpoint

```bash
curl https://staging-api.communityapp.com/api/v1/metrics
```

**PASS**: Returns Prometheus format metrics  
**FAIL**: 404, 500, empty response

**Verify metrics present**:
- `http_requests_total`
- `http_request_duration_ms`
- `identity_registrations_total`

---

## MODERATION WORST-DAY SIMULATION

**Prerequisites**: Steps 1-12 passed

### Setup

1. Create 10 test posts (different personas)
2. Submit 10 reports simultaneously (simulate report spam)
3. Have moderator process queue

### Execution

```bash
# Create admin account (direct DB insert)
INSERT INTO internal_admins (id, username, role, is_active)
VALUES (gen_random_uuid(), 'staging-admin', 'ADMIN', true);

# Login as admin (admin session)
# Access moderation queue
curl .../internal/moderation/queue -b admin-cookies.txt
```

### Verification Points

**1. Queue Ordering**
- ✅ Reports appear in FIFO or priority order
- ❌ Random order, duplicates, missing reports

**2. Report Details**
- ✅ Target content visible
- ✅ Reporter identity HIDDEN
- ✅ Category and reason shown
- ❌ Reporter persona ID exposed

**3. Moderation Actions**
- ✅ Approve/Reject/Flag actions work
- ✅ isDryRun mode clearly marked
- ✅ Explanation logs readable
- ❌ Actions applied when isDryRun=true

**4. Audit Logging**
```sql
SELECT * FROM moderation_logs ORDER BY created_at DESC LIMIT 10;
-- Verify: moderator_id present
-- Verify: action type recorded
-- Verify: target_id correct
-- Verify: explanation present
```

**5. Moderator Friction Points**
- Document any hesitation or confusion
- Time how long 10 reports take to process
- Note any UI clarity issues

**TARGET**: <20 minutes for 10 reports  
**BLOCKER**: >30 minutes, moderator cannot proceed

---

## ALLOWED FIXES VS FORBIDDEN CHANGES

### ✅ ALLOWED (Fix Immediately)

**Crashes**:
- Startup failures
- Null pointer exceptions
- Database connection failures
- Memory leaks causing OOM

**Security Issues**:
- Session hijacking successful
- Rate limiting bypassed
- PII logged to files
- SQL injection possible
- Encryption failures

**Data Corruption**:
- Foreign key violations
- Orphaned records
- Invalid encryption format
- Lost correlation IDs

### ❌ FORBIDDEN (Document Only)

**UX Issues**:
- Confusing error messages
- Slow response times
- Missing tooltips
- Unclear moderation explanations

**Performance**:
- Latency >500ms (unless >5s)
- Database query optimization
- Memory usage optimization

**Features**:
- "Users want X"
- "Would be nice to have Y"
- "Missing feature Z"

**Polish**:
- UI improvements
- Better naming
- Refactoring
- Code cleanup

---

## PASS / FAIL CRITERIA

### ✅ PASS (Proceed to Phase C)

**System Stability**:
- All 12 verification steps pass
- Moderation simulation completes
- No crashes during 1-hour observation period

**Security**:
- Rate limiting enforced
- Session fingerprinting active
- Email encryption format correct (iv:authTag:ciphertext)
- No PII in logs

**Safety**:
- Reports created successfully
- Duplicate prevention works
- Moderation queue functional
- Audit logs present

**Performance** (minimum acceptable):
- Health checks <500ms
- Registration <2s
- Login <1s
- Post creation <1s

### ⚠️ CONDITIONAL PASS (Fix Before Phase C)

**Known Issues** (non-blocking if documented):
- Moderation UX friction (slow but functional)
- Persona confusion points (expected, tracking in beta)
- Performance slower than ideal but acceptable

**Requirements**:
- All issues documented
- Workarounds defined
- No security/safety impact

### ❌ FAIL (Rollback, Do Not Proceed)

**Critical Failures**:
- Privacy violation (email/displayName leaked to logs)
- Session hijacking successful
- Rate limiting ineffective
- Email encryption broken (base64 format found)
- Data corruption (orphaned records, FK violations)

**System Failures**:
- Backend crashes on normal operations
- Database connection unstable
- Redis session loss
- Health checks fail

**Safety Failures**:
- Reports not created
- Moderation queue broken
- Audit logs missing
- Admin guard bypassed

---

## ROLLBACK TRIGGERS

**Immediate Rollback**:
1. Privacy violation detected
2. Session security compromised
3. Data corruption confirmed
4. Backend unstable (crashes >3/hour)

**Rollback Procedure**:
```bash
# Stop staging deployment
docker-compose down
# or
railway down --environment staging

# Document issues in staging-issues.md
# Fix in development
# Re-deploy when ready
```

**DO NOT**:
- Attempt quick fixes in staging
- Disable security features to "make it work"
- Skip verification steps
- Proceed to Phase C with known critical issues

---

## POST-VERIFICATION REPORT

**Required Output** (after all steps):

```markdown
# Staging Verification Results

Date: YYYY-MM-DD
Duration: N hours

## Verification Checklist
1. Registration:     PASS / FAIL
2. Login:            PASS / FAIL
3. Fingerprinting:   PASS / FAIL
... (all 12)

## Moderation Simulation
Queue ordering:      PASS / FAIL
Report details:      PASS / FAIL
Actions:             PASS / FAIL
Audit logs:          PASS / FAIL
Time for 10 reports: N minutes

## Critical Issues
- [List any FAIL results]

## Non-Blocking Issues
- [List UX friction, performance, confusion points]

## Decision: GO / NO-GO for Phase C
- Rationale: ...
```

---

## PHASE C READINESS GATE

**Proceed to Phase C ONLY IF**:

1. ✅ All 12 verification steps PASS
2. ✅ Moderation simulation PASS
3. ✅ Zero critical/blocking issues
4. ✅ Rollback triggers NOT activated
5. ✅ 1-hour stability observation complete

**Phase C = 50 internal users (dry run)**

---

**Controller**: Platform Reliability Engineer  
**Approval Authority**: Founder  
**Escalation**: Stop immediately on critical failure

**Status**: Ready for execution
