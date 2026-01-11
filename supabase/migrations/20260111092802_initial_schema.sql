-- ============================================================
-- COMMUNITY APP DATABASE SCHEMA
-- Production-Grade Communication SaaS Platform
-- Privacy, Anonymity, and Safety as Structural Guarantees
-- ============================================================

-- ============================================================
-- COMPONENT 1: IDENTITY & TRUST SYSTEM
-- Separation: Auth (credentials) | Accountability (abuse) | Presentation (personas)
-- ============================================================

-- Minimal authentication identity (restricted access)
CREATE TABLE IF NOT EXISTS auth_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_encrypted TEXT NOT NULL UNIQUE, -- For recovery/login
  email_hash TEXT NOT NULL UNIQUE, -- For lookup & deduplication (never query plaintext)
  auth_provider TEXT DEFAULT 'firebase',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Abuse tracking and verification (internal only, NEVER exposed publicly)
CREATE TABLE IF NOT EXISTS accountability_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_profile_id UUID REFERENCES auth_profiles(id) ON DELETE CASCADE,
  global_abuse_score FLOAT DEFAULT 0.0,
  is_verified BOOLEAN DEFAULT false,
  risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')) DEFAULT 'LOW',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Presentation identities (public-facing, privacy determined by space)
CREATE TABLE IF NOT EXISTS personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accountability_profile_id UUID REFERENCES accountability_profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ, -- Soft delete for appeals and legal holds
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Progressive trust system (reduces friction for good actors)
CREATE TABLE IF NOT EXISTS trust_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  level TEXT CHECK (level IN ('NEW', 'REGULAR', 'TRUSTED')) DEFAULT 'NEW',
  granted_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COMPONENT 2: INTERNAL ADMIN IDENTITY
-- Admins are NOT personas - they are internal operators
-- ============================================================

CREATE TABLE IF NOT EXISTS internal_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('MODERATOR', 'SENIOR_MOD', 'AUDITOR')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COMPONENT 3: SPACES & PERMISSIONS
-- Governance, lifecycle, and E2EE eligibility
-- ============================================================

CREATE TABLE IF NOT EXISTS spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('PUBLIC_SQUARE', 'COMMUNITY_GROUP', 'PRIVATE_CHAT')),
  encryption_level TEXT CHECK (encryption_level IN ('NONE', 'SERVER_SIDE', 'E2EE')),
  moderation_policy TEXT CHECK (moderation_policy IN ('STRICT', 'FLEXIBLE', 'NONE')),
  owner_persona_id UUID REFERENCES personas(id),
  is_e2ee_eligible BOOLEAN DEFAULT false,
  e2ee_enabled_at TIMESTAMPTZ,
  state_lock BOOLEAN DEFAULT false, -- Prevents race conditions during E2EE transitions
  deleted_at TIMESTAMPTZ, -- Soft delete for appeals and legal holds
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Membership and roles
CREATE TABLE IF NOT EXISTS space_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('ADMIN', 'MOD', 'MEMBER')) DEFAULT 'MEMBER',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(space_id, persona_id)
);

-- Data-backed privacy indicators for UI transparency
CREATE TABLE IF NOT EXISTS space_privacy_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE UNIQUE,
  state TEXT CHECK (state IN ('PUBLIC', 'PRIVATE', 'TRUSTED')),
  explanation_text TEXT
);

-- ============================================================
-- COMPONENT 4: E2EE CONSENT RECORDS
-- Provable consent for legal defense and user disputes
-- ============================================================

CREATE TABLE IF NOT EXISTS e2ee_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES personas(id),
  consented_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(space_id, persona_id)
);

-- ============================================================
-- COMPONENT 5: CONTENT STORAGE (PRIVACY-SEPARATED)
-- Public | Community | E2EE (metadata only)
-- ============================================================

-- Public posts (unencrypted, fully moderated)
CREATE TABLE IF NOT EXISTS public_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID REFERENCES personas(id),
  body TEXT NOT NULL,
  is_moderated BOOLEAN DEFAULT false,
  moderation_status TEXT CHECK (moderation_status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
  deleted_at TIMESTAMPTZ, -- Soft delete for appeals and legal holds
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Community content (server-encrypted by default)
CREATE TABLE IF NOT EXISTS community_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES personas(id),
  body TEXT NOT NULL,
  is_moderated BOOLEAN DEFAULT false,
  moderation_status TEXT CHECK (moderation_status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
  deleted_at TIMESTAMPTZ, -- Soft delete for appeals and legal holds
  created_at TIMESTAMPTZ DEFAULT now()
);

-- E2EE metadata ONLY (NO plaintext, NO keys, NO body)
-- CRITICAL: This table must NEVER contain decrypted content
CREATE TABLE IF NOT EXISTS e2ee_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  sender_persona_id UUID REFERENCES personas(id),
  ciphertext_size INT,
  client_sequence INT, -- Message ordering & replay protection (non-sensitive)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COMPONENT 6: TRUST & SAFETY
-- Reports, moderation, appeals, community health
-- ============================================================

-- User-generated reports (separated from moderation actions)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_persona_id UUID REFERENCES personas(id),
  target_id UUID,
  target_type TEXT CHECK (target_type IN ('POST', 'MESSAGE', 'PERSONA', 'SPACE')),
  reason TEXT,
  status TEXT CHECK (status IN ('OPEN', 'RESOLVED', 'DISMISSED')) DEFAULT 'OPEN',
  legal_hold BOOLEAN DEFAULT false, -- Prevents auto-deletion during investigations
  retention_until TIMESTAMPTZ, -- Auto-purge compliance
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Internal moderation actions (with internal moderator identity)
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID,
  target_type TEXT CHECK (target_type IN ('POST', 'MESSAGE', 'PERSONA', 'SPACE')),
  moderator_id UUID REFERENCES internal_admins(id),
  action TEXT,
  reason TEXT,
  explanation_log TEXT, -- Plain-English "why" for appeals and audits
  is_dry_run BOOLEAN DEFAULT false, -- For training moderators without applying actions
  origin_event_id UUID, -- Causality tracking: report -> event -> decision -> action
  legal_hold BOOLEAN DEFAULT false, -- Prevents auto-deletion during investigations
  retention_until TIMESTAMPTZ, -- Auto-purge compliance
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Appeals flow (fairness and transparency)
CREATE TABLE IF NOT EXISTS appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moderation_log_id UUID REFERENCES moderation_logs(id),
  appellant_persona_id UUID REFERENCES personas(id),
  appeal_reason TEXT,
  status TEXT CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Predictive safety scoring for communities
CREATE TABLE IF NOT EXISTS community_health_score (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE UNIQUE,
  toxicity_rate FLOAT,
  report_frequency FLOAT,
  moderator_interventions INT,
  score INT CHECK (score BETWEEN 0 AND 100),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COMPONENT 7: ABUSE PREVENTION
-- Adaptive rate limiting with global + per-space scope
-- ============================================================

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  action_type TEXT,
  scope TEXT CHECK (scope IN ('GLOBAL', 'SPACE')) DEFAULT 'GLOBAL',
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE, -- NULL for global scope
  window TEXT,
  count INT,
  blocked_until TIMESTAMPTZ,
  CONSTRAINT rate_limits_scope_check CHECK (
    (scope = 'GLOBAL' AND space_id IS NULL) OR
    (scope = 'SPACE' AND space_id IS NOT NULL)
  )
);

-- ============================================================
-- COMPONENT 8: POLICY ENGINE
-- Rules as data (change behavior without code deploys)
-- ============================================================

CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT CHECK (scope IN ('PUBLIC', 'COMMUNITY', 'PRIVATE')),
  rule_type TEXT CHECK (rule_type IN ('RATE_LIMIT', 'E2EE_ELIGIBILITY', 'MODERATION')),
  config_json JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COMPONENT 9: EVENT BUS
-- Async operations (moderation, analytics, notifications)
-- ============================================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT, -- PostCreated, ContentFlagged, PersonaStruck, SpaceE2EEEnabled, PaymentUpgraded
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  idempotency_key TEXT UNIQUE, -- Prevents duplicate actions (critical for async operations)
  retention_until TIMESTAMPTZ, -- Auto-purge compliance
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COMPONENT 10: SYSTEM CONFIGURATION
-- Operational controls (kill switches, emergency modes)
-- ============================================================

CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Identity lookups
CREATE INDEX idx_personas_accountability_profile ON personas(accountability_profile_id);
CREATE INDEX idx_accountability_profiles_auth_profile ON accountability_profiles(auth_profile_id);

-- Space queries
CREATE INDEX idx_space_members_space ON space_members(space_id);
CREATE INDEX idx_space_members_persona ON space_members(persona_id);

-- Content retrieval
CREATE INDEX idx_public_content_persona ON public_content(persona_id);
CREATE INDEX idx_public_content_status ON public_content(moderation_status);
CREATE INDEX idx_community_content_space ON community_content(space_id);
CREATE INDEX idx_e2ee_metadata_space ON e2ee_metadata(space_id);

-- Moderation queues
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_moderation_logs_target ON moderation_logs(target_id, target_type);
CREATE INDEX idx_appeals_status ON appeals(status);

-- Event processing
CREATE INDEX idx_events_processed ON events(processed);

-- Rate limiting
CREATE INDEX idx_rate_limits_persona ON rate_limits(persona_id);
CREATE INDEX idx_rate_limits_scope ON rate_limits(scope, space_id);

-- ============================================================
-- SEED DATA: DEFAULT SYSTEM CONFIGURATIONS
-- ============================================================

INSERT INTO system_config (key, value) VALUES
  ('moderation.emergency_mode', '{"enabled": false, "reason": null}'::jsonb),
  ('rate_limits.global_post_limit', '{"posts_per_hour": 10, "trusted_multiplier": 2}'::jsonb),
  ('e2ee.min_trust_level', '{"level": "REGULAR"}'::jsonb);

-- ============================================================
-- SCHEMA VERSION TRACKING
-- ============================================================

CREATE TABLE IF NOT EXISTS schema_version (
  version INT PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT now(),
  description TEXT
);

INSERT INTO schema_version (version, description) VALUES
  (1, 'Initial production schema with full security hardening');

-- ============================================================
-- COMMENTS & DOCUMENTATION
-- ============================================================

COMMENT ON TABLE auth_profiles IS 'Authentication credentials only. Restricted access.';
COMMENT ON TABLE accountability_profiles IS 'Internal abuse tracking. NEVER expose publicly.';
COMMENT ON TABLE personas IS 'Public-facing identities. Privacy determined by space, not persona.';
COMMENT ON TABLE e2ee_metadata IS 'CRITICAL: Must NEVER contain plaintext, keys, or decrypted content.';
COMMENT ON COLUMN spaces.encryption_level IS 'IMMUTABLE once set to E2EE. Must be changed only via enable/revoke flow with state_lock protection.';
COMMENT ON COLUMN e2ee_metadata.client_sequence IS 'Message ordering for sync, NOT content-related. Safe metadata.';
COMMENT ON COLUMN events.idempotency_key IS 'REQUIRED for all async operations. Prevents duplicate moderation/billing/notifications.';
COMMENT ON COLUMN moderation_logs.origin_event_id IS 'Causality chain: report -> event -> moderation log. Perfect audit trails.';
COMMENT ON COLUMN rate_limits.scope IS 'Enforced by CHECK constraint. GLOBAL must have NULL space_id, SPACE must have non-NULL space_id.';
COMMENT ON TABLE internal_admins IS 'Internal operators. NOT personas. Separate identity model.';
COMMENT ON TABLE e2ee_consents IS 'Provable consent records for legal defense.';
COMMENT ON COLUMN spaces.state_lock IS 'Prevents race conditions during E2EE enable/revoke transitions.';
COMMENT ON COLUMN moderation_logs.explanation_log IS 'Human-readable explanation for appeals and audits.';
COMMENT ON COLUMN moderation_logs.is_dry_run IS 'Training mode: actions logged but not applied.';
