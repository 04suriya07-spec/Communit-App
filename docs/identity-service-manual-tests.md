# Identity Service Manual Verification Tests

**Purpose**: Fast confidence testing for IdentityService  
**Method**: Postman/curl  
**Status**: Ready for execution

## Prerequisites

```bash
# Start PostgreSQL
cd s:\Community-App\backend
docker compose -f docker-compose.dev.yml up -d

# Start NestJS server (when app.module.ts is configured)
npm run dev
```

**Base URL**: `http://localhost:3000`

---

## Test Suite 1: Happy Path (Core Flows)

### 1.1 Register New User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "initialDisplayName": "TestUser"
  }'
```

**Expected Response**:
```json
{
  "personaId": "uuid-here",
  "displayName": "TestUser",
  "correlationId": "uuid-here"
}
```

**Verify**:
- ✅ Returns `personaId` and `displayName`
- ✅ Does NOT return `authProfileId` or `accountabilityProfileId`
- ✅ `correlationId` is unique UUID

### 1.2 Login Existing User

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response**:
```json
{
  "personaId": "same-uuid-from-register",
  "displayName": "TestUser",
  "correlationId": "uuid-here"
}
```

**Verify**:
- ✅ Returns same `personaId` as registration
- ✅ Session contains internal data (check server logs or session store)
- ✅ Does NOT return internal IDs in response body

### 1.3 List Personas

```bash
curl -X GET http://localhost:3000/personas \
  -H "Cookie: session=<session-from-login>"
```

**Expected Response**:
```json
{
  "personas": [
    {
      "id": "uuid-here",
      "displayName": "TestUser",
      "trustLevel": "NEW",
      "createdAt": "2026-01-11T..."
    }
  ],
  "correlationId": "uuid-here"
}
```

**Verify**:
- ✅ Returns 1 persona (the initial one)
- ✅ `trustLevel` is "NEW"
- ✅ No `accountabilityProfileId` in response

### 1.4 Create Second Persona

```bash
curl -X POST http://localhost:3000/personas \
  -H "Content-Type: application/json" \
  -H "Cookie: session=<session-from-login>" \
  -d '{
    "displayName": "SecondPersona"
  }'
```

**Expected Response**:
```json
{
  "persona": {
    "id": "new-uuid-here",
    "displayName": "SecondPersona",
    "trustLevel": "NEW",
    "createdAt": "2026-01-11T..."
  },
  "correlationId": "uuid-here"
}
```

**Verify**:
- ✅ New `personaId` created
- ✅ Belongs to same accountability profile (verify in DB)
- ✅ List personas now returns 2 personas

### 1.5 Rotate Persona

```bash
curl -X POST http://localhost:3000/personas/<persona-id>/rotate \
  -H "Content-Type: application/json" \
  -H "Cookie: session=<session-from-login>" \
  -d '{
    "newDisplayName": "RotatedPersona"
  }'
```

**Expected Response**:
```json
{
  "persona": {
    "id": "new-uuid-here",
    "displayName": "RotatedPersona",
    "trustLevel": "NEW",
    "createdAt": "2026-01-11T..."
  },
  "correlationId": "uuid-here"
}
```

**Verify**:
- ✅ Old persona is deactivated (`is_active = false` in DB)
- ✅ New persona created with fresh ID
- ✅ Accountability profile remains same (verify in DB)

---

## Test Suite 2: Edge Cases

### 2.1 Duplicate Email Registration

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "DifferentPass456!",
    "initialDisplayName": "DuplicateUser"
  }'
```

**Expected Response**:
```json
{
  "statusCode": 409,
  "message": "EMAIL_ALREADY_EXISTS"
}
```

**Verify**:
- ✅ Returns 409 Conflict
- ✅ Error message is "EMAIL_ALREADY_EXISTS"

### 2.2 Invalid Email Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "WrongPass123!"
  }'
```

**Expected Response**:
```json
{
  "statusCode": 401,
  "message": "INVALID_CREDENTIALS"
}
```

**Verify**:
- ✅ Returns 401 Unauthorized
- ✅ Does NOT leak information about whether email exists

### 2.3 Duplicate Display Name (Within 30 Days)

```bash
curl -X POST http://localhost:3000/personas \
  -H "Content-Type: application/json" \
  -H "Cookie: session=<session-from-login>" \
  -d '{
    "displayName": "TestUser"
  }'
```

**Expected Response**:
```json
{
  "statusCode": 409,
  "message": "DISPLAY_NAME_RECENTLY_USED"
}
```

**Verify**:
- ✅ Returns 409 Conflict
- ✅ Enforces 30-day uniqueness window

### 2.4 Rotate Non-Owned Persona

```bash
# Login as user A, try to rotate user B's persona
curl -X POST http://localhost:3000/personas/<other-user-persona-id>/rotate \
  -H "Content-Type: application/json" \
  -H "Cookie: session=<user-a-session>" \
  -d '{
    "newDisplayName": "StolenPersona"
  }'
```

**Expected Response**:
```json
{
  "statusCode": 403,
  "message": "PERSONA_NOT_OWNED"
}
```

**Verify**:
- ✅ Returns 403 Forbidden
- ✅ Prevents cross-user persona manipulation

---

## Test Suite 3: Abuse Scenarios

### 3.1 Max Personas Limit (3 per user)

```bash
# Create 3 personas
for i in {1..3}; do
  curl -X POST http://localhost:3000/personas \
    -H "Content-Type: application/json" \
    -H "Cookie: session=<session>" \
    -d "{\"displayName\": \"Persona$i\"}"
done

# Try to create 4th persona
curl -X POST http://localhost:3000/personas \
  -H "Content-Type: application/json" \
  -H "Cookie: session=<session>" \
  -d '{"displayName": "FourthPersona"}'
```

**Expected Response (4th attempt)**:
```json
{
  "statusCode": 403,
  "message": "MAX_PERSONAS_REACHED"
}
```

**Verify**:
- ✅ Returns 403 after 3 personas created
- ✅ Enforces policy limit (hardcoded to 3 in Phase 1)

### 3.2 Accountability Persistence After Rotation

**Manual DB Check**:
```sql
-- Check accountability profile link remains same
SELECT 
  p1.id as old_persona_id,
  p1.accountability_profile_id,
  p1.is_active as old_active,
  p2.id as new_persona_id,
  p2.accountability_profile_id,
  p2.is_active as new_active
FROM personas p1
JOIN personas p2 ON p1.accountability_profile_id = p2.accountability_profile_id
WHERE p1.is_active = false
  AND p2.is_active = true
ORDER BY p1.created_at DESC
LIMIT 1;
```

**Verify**:
- ✅ Old persona: `is_active = false`
- ✅ New persona: `is_active = true`
- ✅ Both share same `accountability_profile_id`

### 3.3 Email Hash Lookup (Never Encrypted)

**Manual DB Check**:
```sql
-- Verify lookups use email_hash
SELECT 
  email_encrypted,
  email_hash,
  created_at
FROM auth_profiles
WHERE email_hash = SHA256('test@example.com'::bytea)::text;
```

**Verify**:
- ✅ Record found via `email_hash`
- ✅ `email_encrypted` is stored (base64 for Phase 1)
- ✅ Application never queries by `email_encrypted`

---

## Test Suite 4: Security Validations

### 4.1 No Internal ID Leakage

**Test all endpoints** and verify responses NEVER contain:
- ❌ `authProfileId`
- ❌ `accountabilityProfileId`
- ❌ `globalAbuseScore`
- ❌ `riskLevel`

**Check**:
```bash
# Register
curl -X POST .../auth/register ... | jq 'keys'
# Should only have: personaId, displayName, correlationId

# Login
curl -X POST .../auth/login ... | jq 'keys'
# Should only have: personaId, displayName, correlationId

# List Personas
curl -X GET .../personas ... | jq '.personas[0] | keys'
# Should only have: id, displayName, avatarUrl, trustLevel, createdAt
```

### 4.2 Session Contains Internal Data

**Server-side check** (inspect session store or logs):
```javascript
// After login, session should contain:
{
  personaId: "uuid",
  accountabilityProfileId: "uuid",  // Internal only
  trustLevel: "NEW",
  riskLevel: "LOW"
}
```

**Verify**:
- ✅ Session stores `accountabilityProfileId`
- ✅ Session stores `trustLevel` and `riskLevel`
- ✅ These are NOT returned in HTTP response body

### 4.3 Trust Level Defaults to NEW

```bash
# Register new user
curl -X POST .../auth/register ...

# Check persona
curl -X GET .../personas ...
```

**Verify**:
- ✅ All new personas have `trustLevel: "NEW"`
- ✅ Trust level persists to database correctly

---

## Test Suite 5: Database Integrity

### 5.1 Soft Delete Verification

```sql
-- After persona rotation
SELECT id, display_name, is_active, deleted_at
FROM personas
WHERE accountability_profile_id = '<accountability-id>'
ORDER BY created_at DESC;
```

**Verify**:
- ✅ Old personas: `is_active = false`, `deleted_at = NULL` (rotation doesn't set deleted_at)
- ✅ Active personas: `is_active = true`, `deleted_at = NULL`

### 5.2 Email Hashing Consistency

```sql
-- Same email should always produce same hash
SELECT email_hash, COUNT(*) as count
FROM auth_profiles
GROUP BY email_hash
HAVING COUNT(*) > 1;
```

**Verify**:
- ✅ No duplicate email hashes (unless duplicate registration was attempted)
- ✅ Hash is deterministic (same input = same output)

---

## Success Criteria

Identity Service passes manual verification when:

✅ All happy path tests pass  
✅ All edge case tests return correct errors  
✅ Abuse scenario protections work (max personas, ownership)  
✅ No internal IDs leak in any response  
✅ Session contains internal data correctly  
✅ Database integrity maintained (soft deletes, hash consistency)  
✅ Trust levels default to NEW  
✅ Accountability persists through rotation

---

## Next Steps After Verification

1. **If all tests pass**: Proceed to Option 3B (Public Posting Service)
2. **If tests fail**: Fix issues, re-test, do NOT modify frozen schema/contracts
3. **Optional**: Automate these tests as integration test suite

**Status**: Ready for manual execution
