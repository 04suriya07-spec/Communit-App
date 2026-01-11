# Community App - Sites and Links Reference

**Project**: Community App  
**Platform**: Supabase (Free Tier) + Render (Backend)  
**Last Updated**: 2026-01-11  
**⚠️ WARNING**: This file contains sensitive credentials. Do NOT commit to version control!

---

## 📍 Project Information

| Property | Value |
|----------|-------|
| **Project Name** | Community-App |
| **Supabase Ref** | `jeghgombokmmqhwjahbq` |
| **Organization** | 04suriya07-spec's Org |
| **Region** | Default (US East) |
| **Tier** | Free |
| **GitHub Repo** | https://github.com/04suriya07-spec/Communit-App |
| **Backend Deployment** | Render (Free Tier) |

---

## 🌐 Live URLs

### Production API
| Service | URL |
|---------|-----|
| **Backend API** | https://community-app-render.onrender.com |
| **Health Check** | https://community-app-render.onrender.com/api/v1/health/live |
| **API Ready** | https://community-app-render.onrender.com/api/v1/health/ready |
| **Metrics** | https://community-app-render.onrender.com/api/v1/metrics |

### API Endpoints (30+ Routes)

**Health & Metrics:**
- `GET /api/v1/health/live` - Basic liveness check
- `GET /api/v1/health/ready` - Database health check
- `GET /api/v1/metrics` - Prometheus metrics

**Authentication:**
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

**Personas:**
- `GET /api/v1/personas` - List personas
- `POST /api/v1/personas` - Create persona
- `POST /api/v1/personas/:id/rotate` - Rotate persona

**Public Posts:**
- `POST /api/v1/public/posts` - Create post
- `GET /api/v1/public/posts` - List posts
- `DELETE /api/v1/public/posts/:id` - Delete post

**User Posts:**
- `GET /api/v1/users/me/posts` - Get my posts

**Moderation:**
- `POST /api/v1/internal/moderation/trust-level` - Calculate trust
- `POST /api/v1/internal/moderation/abuse-score` - Calculate abuse
- `GET /api/v1/internal/moderation/queue` - Moderation queue
- `POST /api/v1/internal/moderation/posts/:id/action` - Moderate post
- `GET /api/v1/internal/moderation/admins` - List admins
- `GET /api/v1/internal/moderation/logs` - Moderation logs
- `GET /api/v1/internal/moderation/accountability/:id` - Accountability

**Reporting:**
- `POST /api/v1/reports` - Submit report
- `GET /api/v1/reports/me` - My reports
- `GET /api/v1/internal/moderation/reports/:targetId` - Get reports
- `GET /api/v1/internal/moderation/signals` - Report signals

**System:**
- `GET /api/v1/internal/system/moderation-stats` - Moderation statistics
- `GET /api/v1/internal/system/system-stats` - System statistics

---

## 🚀 Render (Backend Deployment)

### Dashboard URLs
| Service | URL |
|---------|-----|
| **Dashboard** | https://dashboard.render.com |
| **Service Page** | https://dashboard.render.com/web/srv-d5ho8ji4d50c73977fm0 |
| **Logs** | https://dashboard.render.com/web/srv-d5ho8ji4d50c73977fm0/logs |
| **Environment** | https://dashboard.render.com/web/srv-d5ho8ji4d50c73977fm0/env|
| **Events** | https://dashboard.render.com/web/srv-d5ho8ji4d50c73977fm0/events |
| **Deploys** | https://dashboard.render.com/web/srv-d5ho8ji4d50c73977fm0/deploys |

### Deployment Info
- **Service ID**: `srv-d5ho8ji4d50c73977fm0`
- **Service Name**: Community-App-Render
- **Region**: Oregon (US West)
- **Instance Type**: Free
- **Environment**: Docker
- **Branch**: main
- **Root Directory**: backend

---

## 🌐 Supabase Dashboard URLs

### Main Dashboards
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

## 📮 Upstash Redis (Session Store)

### Dashboard
| Service | URL |
|---------|-----|
| **Redis Console** | https://console.upstash.com |
| **Database Details** | https://console.upstash.com/redis/9f865908-628e-4d9b-baa0-aa8f0faa003f |

### Database Info
- **Database Name**: community-app-redis
- **Database ID**: `9f865908-628e-4d9b-baa0-aa8f0faa003f`
- **Region**: us-west-2 (Oregon, USA)
- **Type**: Regional
- **Plan**: Free Tier
- **Port**: 6379
- **TLS/SSL**: Enabled

### Connection Details
```bash
# TCP Connection
rediss://default:ARx_AAImcDE2NjcyNzA2ZWU4Yjc0ZGJhODM0YjlmNWRiYzg1Mzg4MHAxNzI5NQ@tops-tetra-7295.upstash.io:6379

# HTTPS Endpoint
https://tops-tetra-7295.upstash.io

# Token
ARx_AAImcDE2NjcyNzA2ZWU4Yjc0ZGJhODM0YjlmNWRiYzg1Mzg4MHAxNzI5NQ

# Read-only Token
Ahx_AAIgcDFDdRE5bHV_W6EpeJqz_yRxHnYE5-Gi4DNzM9Tpdw0mwg
```

---

## 📧 Resend (Email Service)

### Dashboard
| Service | URL |
|---------|-----|
| **Resend Dashboard** | https://resend.com/home |
| **Emails** | https://resend.com/emails |
| **API Keys** | https://resend.com/api-keys |
| **Domains** | https://resend.com/domains |

### SMTP Configuration
```bash
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_USER=resend
MAIL_FROM=noreply@communityapp.com
MAIL_PASS=<YOUR_RESEND_API_KEY>
```

> ⚠️ **TODO**: Get Resend API key and add to `MAIL_PASS` in Render environment variables

---

## 🔑 API Keys & Credentials

### Supabase - Public Keys (Safe for Client-Side)

**Anon Public Key** (JWT Token):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZ2hnb21ib2ttbXFod2phaGJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMjIwMDgsImV4cCI6MjA4MzY5ODAwOH0.oSfUZ-8C293t2KfQMhw-bycA4FRNb-g5ccFheMjX2IQ
```

**Usage**: 
- ✅ Safe to use in frontend/client-side code
- ✅ Respects Row Level Security (RLS) policies
- ✅ Limited to user-level permissions

### Supabase - Private Keys (⚠️ BACKEND ONLY!)

**Service Role Key** (JWT Token):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZ2hnb21ib2ttbXFod2phaGJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEyMjAwOCwiZXhwIjoyMDgzNjk4MDA4fQ.porcaZ64VJj1vkdX9FI1OPh9PRSk5FsdBYbOdTTOb9o
```

**Usage**:
- ⚠️ **NEVER** expose in client-side code
- ⚠️ Backend/server-side only
- ⚠️ Bypasses Row Level Security (full admin access)
- ⚠️ Keep secret at all times

### Render - Generated Secrets

```bash
SESSION_SECRET=69d4b712e8ac05f3
ADMIN_SESSION_SECRET=dc4271b0a53e869f
EMAIL_ENCRYPTION_KEY=MO/RkpTx1g8gjhBVj3j47f+difnTWHEOKGvrXIdRrc8=
```

---

## 🗄️ Database Connection Strings

### Supabase Direct Connection

**Connection String**:
```
postgresql://postgres:Suriya@Community-App@db.jeghgombokmmqhwjahbq.supabase.co:5432/postgres
```

**Components**:
- **Host**: `db.jeghgombokmmqhwjahbq.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: `Suriya@Community-App`

### Connection Pooling (For Render - CURRENTLY USED)

**Transaction Pooler** (Port 6543):
```
postgresql://postgres.jeghgombokmmqhwjahbq:Suriya%40Community-App@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
```

**Components**:
- **Host**: `aws-1-ap-south-1.pooler.supabase.com`
- **Port**: `6543` (pooler mode)
- **User**: `postgres.jeghgombokmmqhwjahbq`
- **Password**: `Suriya%40Community-App` (URL-encoded)
- **Mode**: Transaction pooling
- **Use for**: ✅ Serverless (Render), edge functions, short-lived connections

> 💡 **Note**: Password contains `@` symbol which is URL-encoded as `%40`

---

## 📦 Environment Variables

### Render Backend (Production)

**All 14 Environment Variables:**

```bash
# Database & Supabase
DATABASE_URL=postgresql://postgres.jeghgombokmmqhwjahbq:Suriya%40Community-App@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://jeghgombokmmqhwjahbq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZ2hnb21ib2ttbXFod2phaGJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMjIwMDgsImV4cCI6MjA4MzY5ODAwOH0.oSfUZ-8C293t2KfQMhw-bycA4FRNb-g5ccFheMjX2IQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZ2hnb21ib2ttbXFod2phaGJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEyMjAwOCwiZXhwIjoyMDgzNjk4MDA4fQ.porcaZ64VJj1vkdX9FI1OPh9PRSk5FsdBYbOdTTOb9o

# Security & Sessions
SESSION_SECRET=69d4b712e8ac05f3
ADMIN_SESSION_SECRET=dc4271b0a53e869f
EMAIL_ENCRYPTION_KEY=MO/RkpTx1g8gjhBVj3j47f+difnTWHEOKGvrXIdRrc8=

# Redis (Upstash)
REDIS_URL=rediss://default:ARx_AAImcDE2NjcyNzA2ZWU4Yjc0ZGJhODM0YjlmNWRiYzg1Mzg4MHAxNzI5NQ@tops-tetra-7295.upstash.io:6379

# Email (Resend SMTP)
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_USER=resend
MAIL_FROM=noreply@communityapp.com
# MAIL_PASS=<ADD_RESEND_API_KEY_HERE> ⚠️ TODO

# Application
NODE_ENV=production
PORT=3000
```

### For Frontend (.env.local)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jeghgombokmmqhwjahbq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZ2hnb21ib2ttbXFod2phaGJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMjIwMDgsImV4cCI6MjA4MzY5ODAwOH0.oSfUZ-8C293t2KfQMhw-bycA4FRNb-g5ccFheMjX2IQ

# Backend API
NEXT_PUBLIC_API_URL=https://community-app-render.onrender.com
```

---

## 💻 Applications & Technologies Used

### Cloud Services
| Service | Purpose | Tier | URL |
|---------|---------|------|-----|
| **Supabase** | PostgreSQL Database, Auth, Storage | Free | https://supabase.com |
| **Render** | Backend API Deployment | Free | https://render.com |
| **Upstash** | Redis Session Store | Free | https://upstash.com |
| **Resend** | Email Service (SMTP) | Free | https://resend.com |
| **GitHub** | Code Repository | Free | https://github.com |

### Backend Stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18 | Runtime |
| **NestJS** | Latest | Framework |
| **TypeScript** | Latest | Language |
| **Prisma** | 5.22.0 | ORM |
| **PostgreSQL** | 15 | Database |
| **Redis** | 7.x | Session Store |
| **Docker** | Latest | Containerization |
| **Alpine Linux** | 3.x | Base Image |

### Key Libraries
- `@nestjs/core` - NestJS framework
- `@prisma/client` - Database ORM
- `express-session` - Session management
- `connect-redis` v6.1.3 - Redis session store
- `ioredis` - Redis client
- `class-validator` - Input validation
- `passport` - Authentication

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

**System** (5 tables):
- `rate_limits`
- `policies`
- `events`
- `system_config`
- `schema_version`

### Performance Indexes (14 total)

All indexes created successfully for optimal query performance.

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

**After Frontend Deployment** (Update these):
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/**`

---

## 🛠️ Quick Access Commands

### Git Commands

```bash
# Clone repository
git clone https://github.com/04suriya07-spec/Communit-App.git
cd Communit-App

# View deployment commits
git log --oneline | head -n 10
```

### Supabase CLI

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

### Render CLI

```bash
# Install Render CLI
npm install -g render-cli

# Login
render login

# View service logs
render logs -s srv-d5ho8ji4d50c73977fm0

# Trigger manual deploy
render deploy -s srv-d5ho8ji4d50c73977fm0
```

### API Testing

```bash
# Test live endpoint
curl https://community-app-render.onrender.com/api/v1/health/live

# Test ready endpoint (with DB check)
curl https://community-app-render.onrender.com/api/v1/health/ready

# Test metrics
curl https://community-app-render.onrender.com/api/v1/metrics
```

---

## 📝 Deployment History

### Major Milestones

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-11 | v1.0 | Initial Render deployment |
| 2026-01-11 | v1.1 | Fixed connect-redis v6 compatibility |
| 2026-01-11 | v1.2 | Added OpenSSL for Prisma on Alpine |
| 2026-01-11 | v1.3 | Updated to Supabase pooler connection |
| 2026-01-11 | v1.4 | Fixed Redis authentication |

### Git Commits
- `7a2499c` - Downgrade to connect-redis v6.1.3
- `0e84ec4` - Add OpenSSL to Dockerfile for Prisma
- `5bbceaf` - Use correct OpenSSL packages for Alpine

---

## 📝 Notes & Reminders

✅ **Completed**:
- [x] Database schema deployed (v1.0)
- [x] Email authentication configured
- [x] API keys retrieved
- [x] URL configuration set for localhost
- [x] Backend deployed to Render
- [x] Redis session store configured
- [x] Database pooler connection working
- [x] All 30+ API routes mapped
- [x] Health endpoints responding

⏳ **TODO**:
- [ ] Add MAIL_PASS (Resend API key) to Render
- [ ] Configure CORS for frontend domain
- [ ] Update Supabase URLs after frontend deployment
- [ ] Configure Row Level Security (RLS) policies
- [ ] Set up email templates in Resend
- [ ] Add monitoring and alerts
- [ ] Test all API endpoints
- [ ] Deploy frontend to Vercel

🔒 **Security Checklist**:
- [x] Add this file to `.gitignore`
- [x] Never commit API keys to version control
- [x] Use environment variables for all secrets
- [x] Restrict service_role key to backend only
- [ ] Enable RLS policies on all tables
- [ ] Set up monitoring and alerts
- [ ] Rotate secrets periodically

---

## 🆘 Support & Documentation

| Resource | URL |
|----------|-----|
| **Supabase Docs** | https://supabase.com/docs |
| **Supabase Dashboard** | https://supabase.com/dashboard |
| **Render Docs** | https://render.com/docs |
| **Render Dashboard** | https://dashboard.render.com |
| **Upstash Docs** | https://docs.upstash.com |
| **Resend Docs** | https://resend.com/docs |
| **NestJS Docs** | https://docs.nestjs.com |
| **Prisma Docs** | https://www.prisma.io/docs |
| **GitHub Repo** | https://github.com/04suriya07-spec/Communit-App |

---

**Last Updated**: 2026-01-11T21:17:00+05:30  
**Schema Version**: v1.0  
**Backend Status**: ✅ **LIVE & RUNNING**  
**Deployment URL**: https://community-app-render.onrender.com

