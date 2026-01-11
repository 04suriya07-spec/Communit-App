# Community App - Sites and Links Reference

**Project**: Community App  
**Platform**: Supabase (Free Tier)  
**Last Updated**: 2026-01-11  
**⚠️ WARNING**: This file contains sensitive credentials. Do NOT commit to version control!

---

## 📍 Project Information

| Property | Value |
|----------|-------|
| **Project Name** | Community-App |
| **Project Ref** | `jeghgombokmmqhwjahbq` |
| **Organization** | 04suriya07-spec's Org |
| **Region** | Default (US East) |
| **Tier** | Free |

---

## 🌐 Important URLs

### Supabase Dashboard URLs

| Service | URL |
|---------|-----|
| **Project Home** | https://supabase.com/dashboard/project/jeghgombokmmqhwjahbq |
| **Table Editor** | https://supabase.com/dashboard/project/jeghgombokmmqhwjahbq/editor |
| **SQL Editor** | https://supabase.com/dashboard/project/jeghgombokmmqhwjahbq/sql |
| **Authentication** | https://supabase.com/dashboard/project/jeghgombokmmqhwjahbq/auth/providers |
| **Auth URL Config** | https://supabase.com/dashboard/project/jeghgombokmmqhwjahbq/auth/url-configuration |
| **Database Settings** | https://supabase.com/dashboard/project/jeghgombokmmqhwjahbq/database/settings |
| **API Settings** | https://supabase.com/dashboard/project/jeghgombokmmqhwjahbq/settings/api |
| **API Keys** | https://supabase.com/dashboard/project/jeghgombokmmqhwjahbq/settings/api-keys |
| **General Settings** | https://supabase.com/dashboard/project/jeghgombokmmqhwjahbq/settings/general |

### Project API Endpoints

| Endpoint Type | URL |
|---------------|-----|
| **Project URL** | `https://jeghgombokmmqhwjahbq.supabase.co` |
| **REST API** | `https://jeghgombokmmqhwjahbq.supabase.co/rest/v1/` |
| **GraphQL API** | `https://jeghgombokmmqhwjahbq.supabase.co/graphql/v1` |
| **Realtime** | `wss://jeghgombokkmqhwjahbq.supabase.co/realtime/v1` |
| **Storage** | `https://jeghgombokmmqhwjahbq.supabase.co/storage/v1` |
| **Auth** | `https://jeghgombokmmqhwjahbq.supabase.co/auth/v1` |

---

## 🔑 API Keys & Credentials

### Public Keys (Safe for Client-Side)

**Anon Public Key** (JWT Token):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZ2hnb21ib2ttbXFod2phaGJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMjIwMDgsImV4cCI6MjA4MzY5ODAwOH0.oSfUZ-8C293t2KfQMhw-bycA4FRNb-g5ccFheMjX2IQ
```

**Usage**: 
- ✅ Safe to use in frontend/client-side code
- ✅ Respects Row Level Security (RLS) policies
- ✅ Limited to user-level permissions

### Private Keys (⚠️ BACKEND ONLY!)

**Service Role Key** (JWT Token):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZ2hnb21ib2ttbXFod2phaGJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEyMjAwOCwiZXhwIjoyMDgzNjk4MDA4fQ.porcaZ64VJj1vkdX9FI1OPh9PRSk5FsdBYbOdTTOb9o
```

**Usage**:
- ⚠️ **NEVER** expose in client-side code
- ⚠️ Backend/server-side only
- ⚠️ Bypasses Row Level Security (full admin access)
- ⚠️ Keep secret at all times

---

## 🗄️ Database Connection Strings

### Direct Connection (Default)

**Connection String (URI Format)**:
```
postgresql://postgres:[YOUR-PASSWORD]@db.jeghgombokmmqhwjahbq.supabase.co:5432/postgres
```

**Components**:
- **Host**: `db.jeghgombokmmqhwjahbq.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: `[YOUR-PASSWORD]` _(replace with actual database password)_

### Connection Pooling (Recommended for Serverless)

**Transaction Pooler** (Recommended):
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```
- **Port**: `6543`
- **Mode**: Transaction pooling
- **Use for**: Serverless functions, edge functions, short-lived connections

**Session Pooler**:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```
- **Port**: `5432`
- **Mode**: Session pooling
- **Use for**: Long-lived connections, traditional servers

---

## 🔐 Authentication Configuration

### Email Provider Settings

**Status**: ✅ Enabled

**Settings**:
- ✅ Enable Email provider: ON
- ✅ Secure email change: ON
- ✅ Enable email confirmations: ON
- ✅ Confirm email: ON

### URL Configuration

**Site URL** (Development):
```
http://localhost:3000
```

**Redirect URLs** (Development):
```
http://localhost:3000/**
```

**After Deployment** (Update these):
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/**`

---

## 📦 Environment Variables

### For Frontend (.env.local)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jeghgombokmmqhwjahbq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZ2hnb21ib2ttbXFod2phaGJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMjIwMDgsImV4cCI6MjA4MzY5ODAwOH0.oSfUZ-8C293t2KfQMhw-bycA4FRNb-g5ccFheMjX2IQ
```

### For Backend (.env)

```bash
# Supabase Configuration
SUPABASE_URL=https://jeghgombokmmqhwjahbq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZ2hnb21ib2ttbXFod2phaGJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEyMjAwOCwiZXhwIjoyMDgzNjk4MDA4fQ.porcaZ64VJj1vkdX9FI1OPh9PRSk5FsdBYbOdTTOb9o

# Database (replace [YOUR-PASSWORD] with actual password)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.jeghgombokmmqhwjahbq.supabase.co:5432/postgres
```

---

## 📊 Database Schema

### Tables Deployed (21 total)

**Identity & Trust** (4 tables):
- `auth_profiles`
- `accountability_profiles`
- `personas`
- `trust_levels`

**Administration** (1 table):
- `internal_admins`

**Governance** (3 tables):
- `spaces`
- `space_members`
- `space_privacy_state`

**Encryption & Privacy** (2 tables):
- `e2ee_consents`
- `e2ee_metadata`

**Content** (3 tables):
- `public_content`
- `community_content`
- `e2ee_metadata`

**Safety & Moderation** (4 tables):
- `reports`
- `moderation_logs`
- `appeals`
- `community_health_score`

**System** (4 tables):
- `rate_limits`
- `policies`
- `events`
- `system_config`
- `schema_version`

### Performance Indexes (14 total)

All indexes created successfully for optimal query performance.

---

## 🛠️ Quick Access Commands

### CLI Commands

```bash
# Login to Supabase CLI
npx -y supabase login

# Link to project
npx -y supabase link --project-ref jeghgombokmmqhwjahbq

# Push migrations
npx -y supabase db push

# Pull schema
npx -y supabase db pull

# View migration list
npx -y supabase migration list
```

---

## 📝 Notes & Reminders

✅ **Completed**:
- [x] Database schema deployed (v1.0)
- [x] Email authentication configured
- [x] API keys retrieved
- [x] URL configuration set for localhost

⏳ **TODO** (After Vercel Deployment):
- [ ] Update Site URL to Vercel production URL
- [ ] Add Vercel URL to Redirect URLs
- [ ] Configure Row Level Security (RLS) policies
- [ ] Set up database backups
- [ ] Configure email templates
- [ ] Add custom SMTP (if needed)

🔒 **Security Checklist**:
- [ ] Add this file to `.gitignore`
- [ ] Never commit API keys to version control
- [ ] Use environment variables for all secrets
- [ ] Restrict service_role key to backend only
- [ ] Enable RLS policies on all tables
- [ ] Set up monitoring and alerts

---

## 🆘 Support & Documentation

| Resource | URL |
|----------|-----|
| **Supabase Docs** | https://supabase.com/docs |
| **Supabase Dashboard** | https://supabase.com/dashboard |
| **Community Support** | https://github.com/supabase/supabase/discussions |
| **Status Page** | https://status.supabase.com |

---

**Last Updated**: 2026-01-11T16:03:00+05:30  
**Schema Version**: v1.0  
**Deployment Status**: ✅ Production Ready
