# Production Deployment Quick Start

## Prerequisites
- Docker Desktop installed and running
- Node.js 18+ (for local development)

## Local Development Setup

### 1. Generate package-lock.json (First Time Only)
```bash
cd backend
npm install
```

### 2. Start All Services
```bash
docker-compose up -d
```

This starts:
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3002 (login: admin/admin)

### 3. Check Service Health
```bash
# Check all containers
docker-compose ps

# View backend logs
docker-compose logs -f backend

# Health check
curl http://localhost:3001/api/v1/health/ready
```

### 4. Stop Services
```bash
docker-compose down
```

## Production Deployment

### Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Generate secrets:
```bash
# Email encryption key (32 bytes)
openssl rand -base64 32

# Session secret (64 bytes hex)
openssl rand -hex 64
```

3. Update `.env` with:
- `DATABASE_URL` (production database)
- `EMAIL_ENCRYPTION_KEY`
- `SESSION_SECRET`
- `REDIS_URL`

### Deploy to Cloud

**Option 1: Railway**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Option 2: Render** 
- Connect GitHub repository
- Set environment variables in dashboard
- Deploy from `main` branch

**Option 3: Kubernetes**
```bash
# Build and push image
docker build -t your-registry/community-app:latest .
docker push your-registry/community-app:latest

# Apply K8s manifests (create these based on docker-compose)
kubectl apply -f k8s/
```

## Monitoring

### Access Grafana
1. Open http://localhost:3002
2. Login: admin/admin
3. Add Prometheus datasource (http://prometheus:9090)
4. Import dashboards from `monitoring/grafana/dashboards/`

### Prometheus Metrics
- View metrics: http://localhost:9090
- Query: `http_requests_total`
- Alert rules: `monitoring/prometheus/alerts.yml` (TODO)

## Troubleshooting

### Docker Build Fails
```bash
# Clean build cache
docker-compose build --no-cache

# Check logs
docker-compose logs backend
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U postgres -d community_db
```

### Port Already in Use
```bash
# Find process using port 3001
netstat -ano | findstr :3001  # Windows
lsof -i :3001                 # Mac/Linux

# Change port in docker-compose.yml
```

## Development Workflow

1. Make code changes
2. Restart backend: `docker-compose restart backend`
3. View logs: `docker-compose logs -f backend`
4. Access API: http://localhost:3001/api/v1

## Next Steps

✅ Complete Security Hardening (Phase C)
✅ Run integration tests
✅ Deploy to staging
✅ Production launch
