# Identity Service Implementation Checklist v1.0

**Status**: Implementation-ready  
**Spec**: [`identity-service-spec.md`](../identity-service-spec.md)  
**Phase**: Execution Phase 1

## Implementation Principles

1. **Test-first**: Write tests before implementation
2. **No drift**: Every method maps to spec requirement
3. **Clean boundaries**: Repository → Service → Controller (no skipping)
4. **Type-safe**: Leverage frozen API contracts
5. **Policy-integrated**: Ask Policy Engine, don't embed logic

## File Structure

```
backend/src/identity/
├── controllers/
│   ├── auth.controller.ts
│   └── persona.controller.ts
├── services/
│   ├── identity.service.ts
│   └── persona.service.ts
├── repositories/
│   ├── auth-profile.repository.ts
│   ├── accountability-profile.repository.ts
│   ├── persona.repository.ts
│   └── trust-level.repository.ts
├── dto/
│   ├── register.dto.ts
│   ├── login.dto.ts
│   └── persona.dto.ts
└── tests/
    ├── unit/
    │   ├── identity.service.spec.ts
    │   └── persona.service.spec.ts
    ├── integration/
    │   └── identity-flow.spec.ts
    └── security/
        └── api-leak.spec.ts
```

---

## Phase 1: Repository Layer (Data Access)

### 1.1 AuthProfileRepository

**File**: `repositories/auth-profile.repository.ts`

```typescript
interface AuthProfileRepository {
  // CRITICAL: Always query by hash, never by encrypted email
  findByEmailHash(emailHash: string): Promise<AuthProfile | null>;
  
  create(data: {
    emailEncrypted: string;
    emailHash: string;
    authProvider: string;
  }): Promise<AuthProfile>;
  
  // For GDPR deletion only
  hardDelete(id: string): Promise<void>;`
}
```

**Implementation Notes**:
- Use Prisma client (generated from frozen schema)
- `findByEmailHash` is the ONLY lookup method (enforce in code review)
- Add comment: "WARNING: Never query by emailEncrypted"

**Tests Required**:
- [ ] `findByEmailHash` returns correct profile
- [ ] `findByEmailHash` returns null if not found
- [ ] `create` stores both encrypted and hashed email
- [ ] Attempting to query by `emailEncrypted` is not exposed (no method exists)

---

### 1.2 AccountabilityProfileRepository

**File**: `repositories/accountability-profile.repository.ts`

```typescript
interface AccountabilityProfileRepository {
  findByAuthProfileId(authProfileId: string): Promise<AccountabilityProfile | null>;
  
  create(data: {
    authProfileId: string;
    globalAbuseScore?: number; // default 0.0
    riskLevel?: RiskLevel; // default LOW
  }): Promise<AccountabilityProfile>;
  
  updateAbuseScore(id: string, score: number): Promise<AccountabilityProfile>;
  
  updateRiskLevel(id: string, level: RiskLevel): Promise<AccountabilityProfile>;
  
  // Internal only - NEVER expose in public APIs
  findById(id: string): Promise<AccountabilityProfile | null>;
}
```

**Implementation Notes**:
- This entity is **NEVER** returned in public API responses
- Only Identity Service and Trust & Safety Service access this
- Add comment: "INTERNAL ONLY - Do not expose in PublicPersona responses"

**Tests Required**:
- [ ] `create` sets default abuse score to 0.0
- [ ] `create` sets default risk level to LOW
- [ ] `updateRiskLevel` correctly updates
- [ ] `findByAuthProfileId` returns correct profile

---

### 1.3 PersonaRepository

**File**: `repositories/persona.repository.ts`

```typescript
interface PersonaRepository {
  findById(id: string): Promise<Persona | null>;
  
  findActiveByAccountabilityProfileId(
    accountabilityProfileId: string
  ): Promise<Persona[]>;
  
  create(data: {
    accountabilityProfileId: string;
    displayName: string;
    avatarUrl?: string;
  }): Promise<Persona>;
  
  deactivate(id: string): Promise<Persona>; // Sets is_active = false
  
  softDelete(id: string): Promise<Persona>; // Sets deleted_at = now()
  
  // For display name uniqueness check (within 30 days)
  findRecentByDisplayName(
    displayName: string,
    withinDays: number
  ): Promise<Persona | null>;
}
```

**Implementation Notes**:
- `findActiveByAccountabilityProfileId` only returns `is_active = true` and `deleted_at = null`
- Display name uniqueness enforced via `findRecentByDisplayName`
- Soft delete sets `deleted_at = now()` (hard delete happens async)

**Tests Required**:
- [ ] `create` creates persona with is_active = true
- [ ] `findActiveByAccountabilityProfileId` excludes deleted personas
- [ ] `deactivate` sets is_active = false
- [ ] `softDelete` sets deleted_at timestamp
- [ ] `findRecentByDisplayName` enforces 30-day uniqueness

---

### 1.4 TrustLevelRepository

**File**: `repositories/trust-level.repository.ts`

```typescript
interface TrustLevelRepository {
  findByPersonaId(personaId: string): Promise<TrustLevel | null>;
  
  create(data: {
    personaId: string;
    level: 'NEW' | 'REGULAR' | 'TRUSTED';
  }): Promise<TrustLevel>;
  
  // Phase 1: Manual promotion only (admin tools)
  update(personaId: string, level: 'NEW' | 'REGULAR' | 'TRUSTED'): Promise<TrustLevel>;
}
```

**Implementation Notes**:
- In Phase 1, `update` is called ONLY by admin tools (no public API)
- Default level is 'NEW' for all new personas
- Add comment: "Phase 1: Manual promotion only"

**Tests Required**:
- [ ] `create` defaults to level NEW
- [ ] `findByPersonaId` returns correct trust level
- [ ] Update correctly changes level (admin-initiated only)

---

## Phase 2: Service Layer (Business Logic)

### 2.1 IdentityService

**File**: `services/identity.service.ts`

```typescript
class IdentityService {
  constructor(
    private authProfileRepo: AuthProfileRepository,
    private accountabilityRepo: AccountabilityProfileRepository,
    private policyEngine: PolicyEngineService
  ) {}

  /**
   * Register new user
   * CRITICAL: Always hash email before storing
   */
  async register(data: {
    email: string;
    password: string; // Handled by Firebase, not stored
    initialDisplayName: string;
  }): Promise<{
    personaId: string;
    displayName: string;
  }> {
    // 1. Hash email (for lookups)
    const emailHash = await this.hashEmail(data.email);
    
    // 2. Encrypt email (for recovery)
    const emailEncrypted = await this.encryptEmail(data.email);
    
    // 3. Check if already registered
    const existing = await this.authProfileRepo.findByEmailHash(emailHash);
    if (existing) {
      throw new ConflictException('EMAIL_ALREADY_EXISTS');
    }
    
    // 4. Create auth profile
    const authProfile = await this.authProfileRepo.create({
      emailEncrypted,
      emailHash,
      authProvider: 'firebase',
    });
    
    // 5. Create accountability profile
    const accountabilityProfile = await this.accountabilityRepo.create({
      authProfileId: authProfile.id,
    });
    
    // 6. Create initial persona (via PersonaService)
    const persona = await this.personaService.createPersona({
      accountabilityProfileId: accountabilityProfile.id,
      displayName: data.initialDisplayName,
    });
    
    // 7. Return public data only (NO internal IDs)
    return {
      personaId: persona.id,
      displayName: persona.displayName,
    };
  }

  /**
   * Login user
   * CRITICAL: Always query by email_hash, never email_encrypted
   */
  async login(data: {
    email: string;
    password: string; // Verified by Firebase
  }): Promise<{
    personaId: string;
    displayName: string;
    // Internal session data (not returned to client)
    _internal: {
      accountabilityProfileId: string;
      trustLevel: 'NEW' | 'REGULAR' | 'TRUSTED';
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    };
  }> {
    // 1. Hash email for lookup
    const emailHash = await this.hashEmail(data.email);
    
    // 2. Find auth profile
    const authProfile = await this.authProfileRepo.findByEmailHash(emailHash);
    if (!authProfile) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }
    
    // 3. Get accountability profile
    const accountabilityProfile = await this.accountabilityRepo.findByAuthProfileId(
      authProfile.id
    );
    
    // 4. Get active personas
    const personas = await this.personaService.getActivePersonas(
      accountabilityProfile.id
    );
    
    // 5. Select first active persona (or prompt user to create)
    const activePersona = personas[0];
    if (!activePersona) {
      throw new BadRequestException('NO_ACTIVE_PERSONA');
    }
    
    // 6. Get trust level
    const trustLevel = await this.trustLevelRepo.findByPersonaId(activePersona.id);
    
    // 7. Return public + internal session data
    return {
      personaId: activePersona.id,
      displayName: activePersona.displayName,
      _internal: {
        accountabilityProfileId: accountabilityProfile.id,
        trustLevel: trustLevel.level,
        riskLevel: accountabilityProfile.riskLevel,
      },
    };
  }

  /**
   * Resolve accountability profile from session
   * Used by other services to check abuse scores, risk levels
   */
  async getAccountabilityContext(personaId: string): Promise<{
    accountabilityProfileId: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    globalAbuseScore: number;
  }> {
    const persona = await this.personaRepo.findById(personaId);
    const accountability = await this.accountabilityRepo.findById(
      persona.accountabilityProfileId
    );
    
    // Defensive guard: corruption here means serious state violation
    if (!persona || !accountability) {
      throw new InternalServerErrorException('IDENTITY_CONTEXT_CORRUPT');
    }
    
    return {
      accountabilityProfileId: accountability.id,
      riskLevel: accountability.riskLevel,
      globalAbuseScore: accountability.globalAbuseScore,
    };
  }

  // Email hashing (always use for lookups)
  private async hashEmail(email: string): Promise<string> {
    // Implementation: SHA-256 or similar
    // CRITICAL: This must be deterministic (same email = same hash)
    return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
  }

  // Email encryption (for recovery flows only)
  private async encryptEmail(email: string): Promise<string> {
    // Implementation: AES-256 with app-level key
    // CRITICAL: This is for recovery, never for lookup
    return /* encrypted email */;
  }
}
```

**Tests Required**:
- [ ] `register` creates all 3 entities (auth, accountability, persona)
- [ ] `register` throws EMAIL_ALREADY_EXISTS if duplicate
- [ ] `register` never returns internal IDs
- [ ] `login` always queries by email_hash
- [ ] `login` returns first active persona
- [ ] `login` throws NO_ACTIVE_PERSONA if all deactivated
- [ ] `getAccountabilityContext` returns internal data correctly

---

### 2.2 PersonaService

**File**: `services/persona.service.ts`

```typescript
class PersonaService {
  constructor(
    private personaRepo: PersonaRepository,
    private trustLevelRepo: TrustLevelRepository,
    private policyEngine: PolicyEngineService,
    private eventBus: EventBusService
  ) {}

  /**
   * Create new persona
   * Enforces policy limits (max 3 per user, rate limiting)
   */
  async createPersona(data: {
    accountabilityProfileId: string;
    displayName: string;
    avatarUrl?: string;
  }): Promise<PublicPersona> {
    // 1. Check policy: max personas per user
    const existingPersonas = await this.personaRepo.findActiveByAccountabilityProfileId(
      data.accountabilityProfileId
    );
    
    const maxAllowed = await this.policyEngine.evaluate('max_personas_per_user');
    if (existingPersonas.length >= maxAllowed) {
      throw new ForbiddenException('MAX_PERSONAS_REACHED');
    }
    
    // 2. Check display name uniqueness (30 days)
    const recentlyUsed = await this.personaRepo.findRecentByDisplayName(
      data.displayName,
      30
    );
    if (recentlyUsed) {
      throw new ConflictException('DISPLAY_NAME_RECENTLY_USED');
    }
    
    // 3. Create persona
    const persona = await this.personaRepo.create({
      accountabilityProfileId: data.accountabilityProfileId,
      displayName: data.displayName,
      avatarUrl: data.avatarUrl,
    });
    
    // 4. Create trust level (default NEW)
    await this.trustLevelRepo.create({
      personaId: persona.id,
      level: 'NEW',
    });
    
    // 5. Emit event
    // NOTE: Event emission must be fire-and-forget.
    // IdentityService MUST NOT fail if event bus is temporarily unavailable.
    await this.eventBus.emit('PersonaCreated', {
      personaId: persona.id,
      accountabilityProfileId: data.accountabilityProfileId,
      trustLevel: 'NEW',
    });
    
    // 6. Return public persona (NO internal IDs)
    return this.toPublicPersona(persona);
  }

  /**
   * Rotate persona (fresh start, accountability persists)
   */
  async rotatePersona(data: {
    oldPersonaId: string;
    newDisplayName: string;
    accountabilityProfileId: string; // For verification
  }): Promise<PublicPersona> {
    // 1. Check policy: rotation rate limit
    const allowed = await this.policyEngine.evaluate('persona_rotation_allowed', {
      accountabilityProfileId: data.accountabilityProfileId,
    });
    if (!allowed) {
      throw new ForbiddenException('ROTATION_RATE_LIMITED');
    }
    
    // 2. Verify old persona belongs to user
    const oldPersona = await this.personaRepo.findById(data.oldPersonaId);
    if (oldPersona.accountabilityProfileId !== data.accountabilityProfileId) {
      throw new ForbiddenException('PERSONA_NOT_OWNED');
    }
    
    // 2. Deactivate old persona
    await this.personaRepo.deactivate(data.oldPersonaId);
    
    // 3. Create new persona (uses same accountability profile)
    const newPersona = await this.createPersona({
      accountabilityProfileId: data.accountabilityProfileId,
      displayName: data.newDisplayName,
    });
    
    // 4. Emit rotation event
    await this.eventBus.emit('PersonaRotated', {
      oldPersonaId: data.oldPersonaId,
      newPersonaId: newPersona.id,
      accountabilityProfileId: data.accountabilityProfileId,
    });
    
    return newPersona;
  }

  /**
   * Get active personas for user
   */
  async getActivePersonas(accountabilityProfileId: string): Promise<PublicPersona[]> {
    const personas = await this.personaRepo.findActiveByAccountabilityProfileId(
      accountabilityProfileId
    );
    
    return Promise.all(personas.map(p => this.toPublicPersona(p)));
  }

  /**
   * Convert internal persona to public-safe format
   * CRITICAL: Never include accountabilityProfileId
   */
  private async toPublicPersona(persona: Persona): Promise<PublicPersona> {
    const trustLevel = await this.trustLevelRepo.findByPersonaId(persona.id);
    
    return {
      id: persona.id,
      displayName: persona.displayName,
      avatarUrl: persona.avatarUrl,
      trustLevel: trustLevel.level,
      createdAt: persona.createdAt.toISOString(),
      // ❌ NO accountabilityProfileId
      // ❌ NO globalAbuseScore
      // ❌ NO riskLevel
    };
  }
}
```

**Tests Required**:
- [ ] `createPersona` enforces max persona limit (policy-based)
- [ ] `createPersona` enforces display name uniqueness (30 days)
- [ ] `createPersona` creates trust level (NEW)
- [ ] `createPersona` emits PersonaCreated event
- [ ] `rotatePersona` deactivates old, creates new
- [ ] `rotatePersona` preserves accountability link
- [ ] `toPublicPersona` never includes internal IDs

---

## Phase 3: Controller Layer (API Endpoints)

### 3.1 AuthController

**File**: `controllers/auth.controller.ts`

```typescript
@Controller('auth')
export class AuthController {
  constructor(private identityService: IdentityService) {}

  @Post('register')
  async register(@Body() dto: RegisterRequest): Promise<RegisterResponse> {
    const result = await this.identityService.register({
      email: dto.email,
      password: dto.password,
      initialDisplayName: dto.initialDisplayName,
    });
    
    return {
      personaId: result.personaId,
      displayName: result.displayName,
      correlationId: generateCorrelationId(),
    };
  }

  @Post('login')
  async login(
    @Body() dto: LoginRequest,
    @Req() req: Request
  ): Promise<LoginResponse> {
    const result = await this.identityService.login({
      email: dto.email,
      password: dto.password,
    });
    
    // Store internal session data (NOT returned to client)
    req.session = {
      personaId: result.personaId,
      accountabilityProfileId: result._internal.accountabilityProfileId,
      trustLevel: result._internal.trustLevel,
      riskLevel: result._internal.riskLevel,
    };
    
    // Return public data only
    return {
      personaId: result.personaId,
      displayName: result.displayName,
      correlationId: generateCorrelationId(),
    };
  }
}
```

**Tests Required**:
- [ ] POST /auth/register returns only personaId and displayName
- [ ] POST /auth/register throws EMAIL_ALREADY_EXISTS on duplicate
- [ ] POST /auth/login sets session with internal data
- [ ] POST /auth/login returns only public data

---

### 3.2 PersonaController

**File**: `controllers/persona.controller.ts`

```typescript
@Controller('personas')
export class PersonaController {
  constructor(
    private personaService: PersonaService,
    private identityService: IdentityService
  ) {}

  @Get()
  async listPersonas(@Req() req: Request): Promise<ListPersonasResponse> {
    const session = req.session;
    const personas = await this.personaService.getActivePersonas(
      session.accountabilityProfileId
    );
    
    return {
      personas,
      correlationId: generateCorrelationId(),
    };
  }

  @Post()
  async createPersona(
    @Req() req: Request,
    @Body() dto: CreatePersonaRequest
  ): Promise<CreatePersonaResponse> {
    const session = req.session;
    
    const persona = await this.personaService.createPersona({
      accountabilityProfileId: session.accountabilityProfileId,
      displayName: dto.displayName,
      avatarUrl: dto.avatarUrl,
    });
    
    return {
      persona,
      correlationId: generateCorrelationId(),
    };
  }

  @Post(':id/rotate')
  async rotatePersona(
    @Param('id') personaId: string,
    @Req() req: Request,
    @Body() dto: { newDisplayName: string }
  ): Promise<CreatePersonaResponse> {
    const session = req.session;
    
    const newPersona = await this.personaService.rotatePersona({
      oldPersonaId: personaId,
      newDisplayName: dto.newDisplayName,
      accountabilityProfileId: session.accountabilityProfileId,
    });
    
    return {
      persona: newPersona,
      correlationId: generateCorrelationId(),
    };
  }
}
```

**Tests Required**:
- [ ] GET /personas returns only active personas for current user
- [ ] POST /personas enforces policy limits
- [ ] POST /personas/:id/rotate creates new, deactivates old
- [ ] All responses use frozen API contract types

---

## Phase 4: Integration with Policy Engine

### 4.1 Policy Questions

Identity Service asks Policy Engine:

```typescript
// Max personas per accountability profile
const maxPersonas = await policyEngine.evaluate('max_personas_per_user', {
  accountabilityProfileId,
  riskLevel,
});

// Persona creation rate limit
const canCreate = await policyEngine.evaluate('persona_creation_rate_limit', {
  accountabilityProfileId,
  lastCreatedAt,
});

// Trust level requirement for action
const allowed = await policyEngine.evaluate('min_trust_level_for_action', {
  action: 'create_space',
  trustLevel: 'NEW',
});
```

**Policy Engine returns**: `{ allowed: boolean, reason?: string }`

---

## Phase 5: Testing (Test-First Order)

### 5.1 Unit Tests (Write FIRST)

**Order**:
1. Repository tests (data layer)
2. Service tests (mocked repositories)
3. Controller tests (mocked services)

**Priority tests**:
- [ ] Email hashing (deterministic, never plaintext lookup)
- [ ] Persona creation (enforces limits)
- [ ] Rotation (accountability persists)
- [ ] Ban enforcement (HIGH risk blocks creation)
- [ ] Public API (never returns internal IDs)

### 5.2 Integration Tests

**Scenarios**:
- [ ] Full registration flow (auth → accountability → persona)
- [ ] Login flow (email_hash lookup)
- [ ] Persona rotation (old deactivated, new created)
- [ ] Multiple personas (same user, up to 3)

### 5.3 Security Tests

**Critical validations**:
- [ ] PublicPersona never contains `accountabilityProfileId`
- [ ] Email lookups always use `email_hash`
- [ ] Deleted personas hidden from public queries
- [ ] Session contains internal data, response does not

---

## Phase 6: Implementation Sequence

**Strict order** (no skipping):

1. ✅ Set up Prisma (already done)
2. [ ] Write repository interfaces
3. [ ] Write repository tests (RED)
4. [ ] Implement repositories (GREEN)
5. [ ] Write service tests (RED)
6. [ ] Implement services (GREEN)
7. [ ] Write controller tests (RED)
8. [ ] Implement controllers (GREEN)
9. [ ] Write integration tests (RED)
10. [ ] Fix integration issues (GREEN)
11. [ ] Write security tests (RED)
12. [ ] Verify no leaks (GREEN)
13. [ ] Manual verification (Postman/curl)

**Do NOT proceed to next step until tests pass.**

---

## Success Criteria

Identity Service is complete when:

1. ✅ All unit tests pass
2. ✅ All integration tests pass
3. ✅ All security tests pass
4. ✅ Manual verification (register, login, rotate) works
5. ✅ No internal IDs leak in responses (compile-time checked)
6. ✅ Email lookups always use hash (code review)
7. ✅ Policy Engine integrated (evaluation only)
8. ✅ Event Bus emits PersonaCreated, PersonaRotated

**Non-goals**:
- Trust level auto-promotion (manual only Phase 1)
- Abuse score calculation (placeholder only)

---

## Next Service (After Identity Complete)

- Policy Engine (needs persona context)
- Public Posting (needs persona resolution)
- Trust & Safety Dashboard (needs accountability linkage)

**Version**: 1.0  
**Spec**: identity-service-spec.md  
**Status**: Ready for test-first implementation
