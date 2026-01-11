# PolicyEngine v1 Specification

**Status**: Planning  
**Phase**: Execution Phase 1  
**Purpose**: Replace hardcoded limits with centralized policy rules

## Design Principles

1. **Synchronous** - No async/await for simple rule lookups
2. **Read-Only** - Policies are data, not mutations
3. **Deterministic** - Same input = same output (no randomness, no time-based non-determinism)
4. **Centralized** - All rules in one place
5. **Type-Safe** - TypeScript interfaces for policy structure

---

## Policy Categories

### 1. Identity Policies

**Max Personas**:
```typescript
{
  "persona_max_count": {
    "NEW": 3,
    "REGULAR": 5,
    "TRUSTED": 10
  }
}
```

**Persona Rotation**:
```typescript
{
  "persona_rotation_cooldown_days": 30,
  "persona_rotation_max_per_month": 2
}
```

**Display Name Uniqueness**:
```typescript
{
  "display_name_uniqueness_window_days": 30
}
```

### 2. Posting Policies

**Rate Limits (per hour)**:
```typescript
{
  "post_rate_limit_hourly_by_trust": {
    "NEW": 10,
    "REGULAR": 20,
    "TRUSTED": 50
  },
  "post_rate_limit_hourly_account_total": 30
}
```

**Content Limits**:
```typescript
{
  "post_body_max_length": 5000,
  "post_body_min_length": 1
}
```

### 3. Trust & Safety Policies

**Risk Level Thresholds**:
```typescript
{
  "abuse_score_threshold_low": 0.3,
  "abuse_score_threshold_medium": 0.7
}
```

---

## PolicyEngine Interface

```typescript
interface IPolicyEngine {
  /**
   * Check if action is allowed based on policy
   */
  evaluate(
    policyName: string,
    context: Record<string, any>
  ): boolean;

  /**
   * Get numeric policy value
   */
  getNumericValue(
    policyName: string,
    context?: Record<string, any>
  ): number;

  /**
   * Get policy configuration
   */
  getPolicy(policyName: string): any;
}
```

---

## Policy Evaluation Examples

### Example 1: Max Personas Check

**Current (IdentityService)**:
```typescript
const maxAllowed = 3; // Hardcoded
if (existingPersonas.length >= maxAllowed) {
  throw new ForbiddenException('MAX_PERSONAS_REACHED');
}
```

**With PolicyEngine**:
```typescript
const maxAllowed = this.policyEngine.getNumericValue(
  'persona_max_count',
  { trustLevel }
);
if (existingPersonas.length >= maxAllowed) {
  throw new ForbiddenException('MAX_PERSONAS_REACHED');
}
```

### Example 2: Post Rate Limit

**Current (PostService)**:
```typescript
if (recentPersonaPosts.length >= 10) { // Hardcoded
  throw new ForbiddenException('RATE_LIMIT_EXCEEDED');
}
```

**With PolicyEngine**:
```typescript
const allowed = this.policyEngine.evaluate('post_rate_limit', {
  personaId,
  trustLevel,
  recentPostCount,
});
if (!allowed) {
  throw new ForbiddenException('RATE_LIMIT_EXCEEDED');
}
```

### Example 3: Display Name Uniqueness

**Current (PersonaService)**:
```typescript
const recentlyUsed = await this.personaRepo.findRecentByDisplayName(
  displayName,
  30 // Hardcoded
);
```

**With PolicyEngine**:
```typescript
const windowDays = this.policyEngine.getNumericValue(
  'display_name_uniqueness_window_days'
);
const recentlyUsed = await this.personaRepo.findRecentByDisplayName(
  displayName,
  windowDays
);
```

---

## Policy Storage

### Phase 1: In-Memory (JSON)

```typescript
// policy-config.ts
export const policyConfig = {
  // Identity Policies
  persona_max_count: {
    NEW: 3,
    REGULAR: 5,
    TRUSTED: 10,
  },
  persona_rotation_cooldown_days: 30,
  persona_rotation_max_per_month: 2,
  display_name_uniqueness_window_days: 30,

  // Posting Policies
  post_rate_limit_hourly_by_trust: {
    NEW: 10,
    REGULAR: 20,
    TRUSTED: 50,
  },
  post_rate_limit_hourly_account_total: 30,
  post_body_max_length: 5000,
  post_body_min_length: 1,

  // Trust & Safety Policies
  abuse_score_threshold_low: 0.3,
  abuse_score_threshold_medium: 0.7,
};
```

### Phase 2: Database (Future)

Use `policies` table from frozen schema for dynamic updates.

---

## Implementation Structure

```
backend/src/policy/
├── config/
│   └── policy-config.ts (in-memory policies)
├── services/
│   └── policy-engine.service.ts
└── policy.module.ts
```

---

## PolicyEngine Service Implementation

```typescript
@Injectable()
export class PolicyEngineService implements IPolicyEngine {
  constructor(private readonly policies: typeof policyConfig) {}

  /**
   * Evaluate if action is allowed
   */
  evaluate(
    policyName: string,
    context: Record<string, any>
  ): boolean {
    switch (policyName) {
      case 'persona_creation_allowed':
        return this.evaluatePersonaCreation(context);
      
      case 'post_rate_limit':
        return this.evaluatePostRateLimit(context);
      
      case 'persona_rotation_allowed':
        return this.evaluatePersonaRotation(context);
      
      default:
        throw new Error(`Unknown policy: ${policyName}`);
    }
  }

  /**
   * Get numeric value from policy
   */
  getNumericValue(
    policyName: string,
    context?: Record<string, any>
  ): number {
    const policy = this.policies[policyName];
    
    if (typeof policy === 'number') {
      return policy;
    }
    
    // Handle trust-level-based policies
    if (typeof policy === 'object' && context?.trustLevel) {
      return policy[context.trustLevel] || policy.NEW;
    }
    
    throw new Error(`Cannot get numeric value for policy: ${policyName}`);
  }

  /**
   * Get raw policy configuration
   */
  getPolicy(policyName: string): any {
    return this.policies[policyName];
  }

  // Private evaluation methods
  private evaluatePersonaCreation(context: {
    currentPersonaCount: number;
    trustLevel: string;
  }): boolean {
    const maxAllowed = this.policies.persona_max_count[context.trustLevel];
    return context.currentPersonaCount < maxAllowed;
  }

  private evaluatePostRateLimit(context: {
    recentPostCount: number;
    trustLevel: string;
  }): boolean {
    const limit = this.policies.post_rate_limit_hourly_by_trust[context.trustLevel];
    return context.recentPostCount < limit;
  }

  private evaluatePersonaRotation(context: {
    lastRotationDate?: Date;
  }): boolean {
    if (!context.lastRotationDate) {
      return true; // First rotation always allowed
    }
    
    const cooldownDays = this.policies.persona_rotation_cooldown_days;
    const daysSince = Math.floor(
      (Date.now() - context.lastRotationDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysSince >= cooldownDays;
  }
}
```

---

## Service Refactoring

### IdentityService Changes

**Before**:
```typescript
const maxAllowed = 3;
if (existingPersonas.length >= maxAllowed) {
  throw new ForbiddenException('MAX_PERSONAS_REACHED');
}
```

**After**:
```typescript
const allowed = this.policyEngine.evaluate('persona_creation_allowed', {
  currentPersonaCount: existingPersonas.length,
  trustLevel,
});
if (!allowed) {
  throw new ForbiddenException('MAX_PERSONAS_REACHED');
}
```

### PostService Changes

**Before**:
```typescript
if (recentPersonaPosts.length >= 10) {
  throw new ForbiddenException('RATE_LIMIT_EXCEEDED');
}
```

**After**:
```typescript
const allowed = this.policyEngine.evaluate('post_rate_limit', {
  recentPostCount: recentPersonaPosts.length,
  trustLevel: persona.trustLevel,
});
if (!allowed) {
  throw new ForbiddenException('RATE_LIMIT_EXCEEDED');
}
```

---

## Success Criteria

PolicyEngine v1 is complete when:

1. ✅ All hardcoded limits removed from services
2. ✅ PolicyEngine evaluates synchronously
3. ✅ Policy configuration centralized
4. ✅ Trust level modifiers work (NEW vs REGULAR vs TRUSTED)
5. ✅ Services inject PolicyEngine via dependency injection
6. ✅ No breaking changes to service APIs
7. ✅ Deterministic behavior (same input = same output)

---

## Future Enhancements (Phase 2)

- Load policies from database (`policies` table)
- Admin UI to edit policies
- Policy versioning
- A/B testing support
- Real-time policy updates (reload without restart)

---

**Version**: 1.0  
**Status**: Ready for implementation  
**Dependencies**: None (self-contained)
