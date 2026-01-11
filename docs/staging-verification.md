# Staging Deployment Verification Checklist

**Purpose**: Validate production deployment flow in staging environment  
**Duration**: ~2 hours  
**Status**: Ready to execute

---

## Pre-Deployment

### 1. Environment Setup ✅

**Generate Secrets** (already done):
```bash
# SESSION_SECRET (generated)
# ADMIN_SESSION_SECRET (generated)
# EMAIL_ENCRYPTION_KEY (generated)
```

**Create staging .env**:
```bash
NODE_ENV=staging
PORT=3001
DATABASE_URL=<staging_postgres_url>
REDIS_URL=<staging_redis_url>
SESSION_SECRET=<generated_above>
ADMIN_SESSION_SECRET=<generated_above>
EMAIL_ENCRYPTION_KEY=<generated_above>
CORS_ORIGIN=https://staging.communityapp.com
LOG_LEVEL=debug
```

### 2. Infrastructure Provisioning

**Option A: Railway Staging**
```bash
railway login
railway environment create staging
railway up --environment staging
```

**Option B: Render Staging**
- Create new web service (staging branch)
- Set environment variables
- Deploy

**Option C: Docker Compose Locally**
```bash
docker-compose -f docker-compose.staging.yml up -d
```

---

## Deployment Verification

### Step 1: Health Check ✅

**Test liveness probe**:
```bash
curl https://staging-api.communityapp.com/api/v1/health/live
# Expected: {"status":"alive","timestamp":"..."}
```

**Test readiness probe**:
```bash
curl https://staging-api.communityapp.com/api/v1/health/ready
# Expected: {"status":"healthy","uptime":123,"checks":{"database":{"status":"healthy","responseTime":5}}}
```

**Verify metrics endpoint** (internal only):
```bash
curl https://staging-api.communityapp.com/api/v1/metrics
# Expected: Prometheus format metrics
```

---

### Step 2: Database Migration ✅

```bash
# SSH to staging or use Railway CLI
npx prisma generate
npx prisma db push

# Verify tables created
npx prisma studio
```

**Manual verification**:
- [ ] All tables present (auth_profiles, personas, public_content, etc.)
- [ ] Indexes created
- [ ] Foreign keys enforced

---

### Step 3: Redis Connection ✅

```bash
# Test Redis connection
redis-cli -h <staging_redis_host> ping
# Expected: PONG
```

**Verify session storage**:
```bash
# After creating a session (Step 4), check Redis
redis-cli -h <staging_redis_host>
> KEYS sess:user:*
# Expected: List of session keys
```

---

### Step 4: Registration Flow ✅

**Create test user**:
```bash
curl -X POST https://staging-api.communityapp.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@staging.com",
    "password": "TestStaging123!",
    "initialDisplayName": "StagingUser"
  }'

# Expected: 201 Created
# { "personaId": "uuid", "displayName": "StagingUser" }
```

**Verify in database**:
```sql
-- Check auth_profile created
SELECT * FROM auth_profiles WHERE email_hash = encode(sha256('test@staging.com'::bytea), 'hex');

-- Check accountability_profile created
SELECT * FROM accountability_profiles WHERE auth_profile_id = '<auth_id_from_above>';

-- Check persona created
SELECT * FROM personas WHERE accountability_profile_id = '<accountability_id>';

-- Check trust_level created
SELECT * FROM trust_levels WHERE persona_id = '<persona_id>';
```

---

### Step 5: Login Flow ✅

**Login test user**:
```bash
curl -X POST https://staging-api.communityapp.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@staging.com",
    "password": "TestStaging123!"
  }'

# Expected: 200 OK
# Sets session cookie (check cookies.txt)
```

**Verify session in Redis**:
```bash
redis-cli -h <staging_redis_host>
> KEYS sess:user:*
> GET sess:user:<session_id>
# Should contain user data
```

---

### Step 6: Posting Flow ✅

**Create post**:
```bash
curl -X POST https://staging-api.communityapp.com/api/v1/public/posts \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "personaId": "<persona_id_from_step4>",
    "body": "This is a test post from staging!"
  }'

# Expected: 201 Created
# { "postId": "uuid", "createdAt": "..." }
```

**Get public feed**:
```bash
curl https://staging-api.communityapp.com/api/v1/public/posts \
  -H "Content-Type: application/json"

# Expected: 200 OK
# { "posts": [...], "nextCursor": null }
```

---

### Step 7: Reporting Flow ✅

**Submit report**:
```bash
curl -X POST https://staging-api.communityapp.com/api/v1/reports \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "targetId": "<post_id_from_step6>",
    "targetType": "POST",
    "category": "SPAM",
    "detail": "Test report for staging validation"
  }'

# Expected: 200 OK
# { "submitted": true, "message": "..." }
```

---

### Step 8: Rate Limiting ✅

**Test auth rate limit** (5 req/15min):
```bash
# Attempt 6 failed logins rapidly
for i in {1..6}; do
  curl -X POST https://staging-api.communityapp.com/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"fake@test.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n"
done

# Expected: First 5 return 401, 6th returns 429 (rate limited)
```

**Test content rate limit** (30 req/min):
```bash
# Attempt 31 posts rapidly
# Expected: First 30 succeed, 31st returns 429
```

---

### Step 9: Session Security ✅

**Test session fingerprinting**:
```bash
# Login from one IP/User-Agent
curl -X POST https://staging-api.communityapp.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "User-Agent: Test-Agent-1" \
  -c cookies1.txt \
  -d '{"email":"test@staging.com","password":"TestStaging123!"}'

# Try using same session from different User-Agent
curl -X GET https://staging-api.communityapp.com/api/v1/personas \
  -H "User-Agent: Test-Agent-2" \
  -b cookies1.txt

# Expected: 401 Unauthorized (SESSION_INVALID)
```

---

### Step 10: Encryption Verification ✅

**Check email encryption in database**:
```sql
SELECT email_encrypted, email_hash FROM auth_profiles WHERE email_hash = encode(sha256('test@staging.com'::bytea), 'hex');

-- email_encrypted should be: base64(iv:authTag:ciphertext)
-- Should contain colons (AES-256-GCM format)
-- email_hash should be SHA-256 hex (64 chars)
```

---

### Step 11: Monitoring & Oberservability ✅

**Check Prometheus metrics**:
- Navigate to Prometheus: https://prometheus-staging.communityapp.com
- Query: `http_requests_total` (should show request counts)
- Query: `http_request_duration_ms` (should show latency histogram)

**Check Grafana dashboards**:
- Navigate to Grafana: https://grafana-staging.communityapp.com
- Login: admin / <GRAFANA_PASSWORD>
- Verify datasource connected
- Check request rate, error rate, latency panels

**Check logs**:
```bash
# View backend logs
docker-compose logs -f backend
# or
railway logs --environment staging

# Verify:
# - JSON format
# - Correlation IDs present
# - No PII in logs (emails, display names)
```

---

### Step 12: Admin Tools ✅

**Create admin account** (direct DB insert for testing):
```sql
INSERT INTO internal_admins (id, username, role, is_active)
VALUES (gen_random_uuid(), 'staging-admin', 'ADMIN', true);
```

**Test admin endpoints**:
```bash
# Login as admin (separate session)
# Test moderation queue
curl https://staging-api.communityapp.com/api/v1/internal/moderation/queue \
  -H "Content-Type: application/json" \
  -b admin-cookies.txt

# Expected: 200 OK with queue items
```

---

## Performance Testing

### Load Test (Optional but Recommended)

**Install k6**:
```bash
npm install -g k6
```

**Create load test script** (`load-test.js`):
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 50 },   // Ramp to 50 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
};

export default function () {
  let res = http.get('https://staging-api.communityapp.com/api/v1/health/ready');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

**Run load test**:
```bash
k6 run load-test.js
```

**Success criteria**:
- 95% requests < 200ms
- 0% errors
- No memory leaks (check Grafana)

---

## Rollback Plan

**If critical issues found**:

1. **Stop deployment**:
```bash
railway down --environment staging
# or
docker-compose down
```

2. **Revert changes**:
```bash
git revert <commit_hash>
git push
```

3. **Document issues** in `staging-issues.md`

4. **Fix in development**, redeploy

---

## Sign-Off Checklist

**Deployment**:
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Redis connected
- [ ] SSL certificate active

**Functionality**:
- [ ] Registration works
- [ ] Login works
- [ ] Posting works
- [ ] Reporting works
- [ ] Rate limiting works
- [ ] Session security works

**Security**:
- [ ] Encryption verified (AES-256-GCM)
- [ ] Session fingerprinting active
- [ ] Rate limits enforced
- [ ] No secrets in logs

**Observability**:
- [ ] Prometheus metrics flowing
- [ ] Grafana dashboards populated
- [ ] Logs structured and sanitized
- [ ] Health checks passing

**Performance**:
- [ ] Response times acceptable (<200ms p95)
- [ ] No memory leaks
- [ ] Load test passed

---

## Approval

**Staging Verified By**: _____________  
**Date**: _____________  
**Approved for Production**: YES / NO  
**Notes**: _____________

---

**Next Steps After Approval**:
1. Schedule production deployment
2. Update DNS records
3. Configure production monitoring alerts
4. Prepare rollback procedure
5. Brief on-call team

**Status**: Ready for staging deployment! 🚀
