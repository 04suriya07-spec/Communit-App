-- Community System Tables Migration
-- Phase 1: Core schema for communities, members, follows, and join requests

-- Create enums
CREATE TYPE "CommunityType" AS ENUM ('private', 'public_restricted', 'public_open');
CREATE TYPE "MemberRole" AS ENUM ('owner', 'admin', 'moderator', 'member', 'follower', 'guest');
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- Communities table
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type "CommunityType" NOT NULL,
  creator_id UUID NOT NULL,
  avatar_url TEXT,
  banner_url TEXT,
  is_searchable BOOLEAN DEFAULT true,
  member_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_communities_type ON communities(type);
CREATE INDEX idx_communities_creator ON communities(creator_id);
CREATE INDEX idx_communities_searchable ON communities(is_searchable) WHERE deleted_at IS NULL;
CREATE INDEX idx_communities_slug ON communities(slug) WHERE deleted_at IS NULL;

-- Community members table
CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role "MemberRole" NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  invited_by UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE (community_id, user_id)
);

CREATE INDEX idx_community_members_community ON community_members(community_id);
CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_community_members_role ON community_members(community_id, role);

-- Follows table
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  followed_at TIMESTAMPTZ DEFAULT now(),
  notification_enabled BOOLEAN DEFAULT true,
  UNIQUE(user_id, community_id)
);

CREATE INDEX idx_follows_user ON follows(user_id);
CREATE INDEX idx_follows_community ON follows(community_id);

-- Join requests table
CREATE TABLE join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status "RequestStatus" NOT NULL,
  message TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_join_requests_community ON join_requests(community_id, status);
CREATE INDEX idx_join_requests_user ON join_requests(user_id);

-- Verify tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('communities', 'community_members', 'follows', 'join_requests')
ORDER BY table_name;
