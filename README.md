# Community App - Production-Grade Communication SaaS

A multi-layered communication platform where privacy, anonymity, and safety are **structural guarantees**, not marketing claims.

## Architecture

The platform consists of three clearly separated spaces:

### 🌐 Public Space
- Anonymous by default
- Fully moderated
- No encryption
- Safe for ideas, opinions, discussions

### 👥 Community Space
- Groups with default server-side encryption
- Full moderation
- Optional E2EE only after trust criteria

### 🔒 Private Space (Paid)
- True end-to-end encryption
- No content scanning
- No platform-level moderation (content is inaccessible by design)
- Explicit privacy guarantees

## Core Principles (Non-Negotiable)

1. **Anonymity must be accountable internally**
2. **Encryption must be honest** (no backdoors, no silent scanning)
3. **Safety is structural, not reactive**
4. **Trust & Safety is an independent system**

## Non-Goals

To protect user trust and platform safety, the following are explicitly **out of scope**:

- Engagement-driven algorithms (trending, virality scoring)
- Follower graphs or influence metrics  
- Public identity verification or real-name enforcement
- Content scanning in E2EE spaces
- Retroactive decryption or access to encrypted content
- Growth hacks that weaken moderation or privacy boundaries

**If a feature conflicts with privacy boundaries or safety guarantees, it is intentionally excluded.**

## Threat Model (Summary)

This platform is designed with the following threat assumptions:

- The server is not trusted with E2EE content
- Internal administrators are not trusted with user plaintext
- Databases may be breached and must minimize blast radius
- Moderation decisions must be auditable and explainable
- Legal requests may occur and must not enable mass surveillance

**Design choices intentionally limit what any single system or actor can access.**

## Who This Project Is For

This project is designed for:
- Engineers interested in privacy-first systems
- Contributors who respect clear architectural boundaries
- Moderators and policy designers
- Teams building long-lived, regulator-aware platforms

It is **not** designed for:
- Growth-at-all-costs social media experiments
- Surveillance-driven moderation systems
- Identity-first or influencer-based platforms

## Tech Stack

- **Frontend**: Next.js (Web), React Native (mobile - future)
- **Backend**: NestJS
- **Database**: PostgreSQL (Supabase)
- **Cache**: Redis
- **Edge**: Cloudflare (WAF, rate limiting, DDoS protection)
- **E2EE**: Libsignal
- **Payments**: Stripe (Phase 2)

## Project Structure

```
Community-App/
├── database/
│   └── schema.sql          # Production-grade SQL schema
├── backend/
│   ├── src/
│   │   ├── identity/       # Identity + trust services
│   │   ├── moderation/     # Trust & Safety
│   │   ├── spaces/         # Space management
│   │   └── policy/         # Policy engine
│   └── prisma/
│       └── schema.prisma   # Prisma ORM schema
└── shared/
    └── api-contracts.ts    # Type-safe API definitions
```

## Security Features

### Identity Isolation
- `auth_profiles`: Authentication credentials only (restricted access)
- `accountability_profiles`: Internal abuse tracking (never exposed publicly)
- `personas`: Public-facing identities (privacy determined by space)

### Privacy-Separated Content Storage
- `public_content`: Unencrypted, fully moderated
- `community_content`: Server-encrypted, moderated
- `e2ee_metadata`: **Metadata only** (NO plaintext, NO keys)

### Trust & Safety
- Internal admin model (separate from personas)
- E2EE consent records (provable, timestamped)
- Dry-run moderation mode (for training)
- Human-readable explanation logs
- Appeals flow
- Community health scoring

### Abuse Prevention
- Dual-scope rate limiting (global + per-space)
- Progressive trust system
- Policy engine (rules as data)
- Event-driven moderation

### Operational Controls
- State locks (prevents race conditions during E2EE transitions)
- Retention policies (auto-purge after 90 days)
- System configuration (kill switches, emergency modes)

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Supabase account

### Setup

1. **Clone and install**:
   ```bash
   npm install
   ```

2. **Set up Supabase**:
   - Create a new Supabase project
   - Run `database/schema.sql` to create tables
   - Copy DATABASE_URL (Transaction Pooler URI)

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Add your DATABASE_URL and other secrets
   ```

4. **Generate Prisma client**:
   ```bash
   cd backend
   npx prisma generate
   ```

## Development Phases

> [!WARNING]
> Phase 0 and Phase 1 are **frozen in scope** to prevent premature complexity.

### Phase 0: Foundation ✓
- [x] Database schema with security hardening
- [x] Prisma schema
- [x] API contracts with leak prevention
- [ ] Supabase setup
- [ ] Identity Service implementation

### Phase 1: MVP
- [ ] Public text posts
- [ ] Community groups (moderated)
- [ ] Trust & Safety dashboard
- [ ] Reports + appeals
- [ ] Rate limiting

### Phase 2: Paid Privacy
- [ ] E2EE messaging (libsignal)
- [ ] Stripe integration
- [ ] Verified identity (optional)

## Key Design Decisions

### Why separate auth_profiles and accountability_profiles?
**Legal defensibility**. If compromised or subpoenaed, minimal user data is exposed in one place.

### Why metadata-only for E2EE?
**Ethical boundary**. We cannot scan what we cannot read. This is enforced structurally.

### Why state locks?
**Safety during transitions**. E2EE enable/revoke is a dangerous moment. State locks prevent race conditions and partial encryption states.

### Why provable consent?
**Legal defense**. App store reviews, regulators, user disputes—all require evidence of explicit consent, not just UX text.

### Why dry-run moderation?
**Moderator training**. New moderators can practice without risk. Actions are logged but not applied.

## Testing Strategy

- **Identity isolation**: No internal IDs leak to public APIs (build fails if detected)
- **E2EE storage**: `e2ee_metadata` contains NO plaintext
- **E2EE sessions**: New session on enable, no retroactive access
- **Consent enforcement**: E2EE cannot be enabled without all members consenting
- **State lock enforcement**: Messages blocked while `state_lock = true`
- **Rate limiting**: Global + space scope both enforced

## License

[Your License Here]

## Contributing

[Contributing Guidelines]
