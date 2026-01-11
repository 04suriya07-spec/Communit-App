# Observability & Ops Readiness Specification v1.0

**Status**: Planning  
**Phase**: 1.5 - Operational Hardening  
**Purpose**: Production visibility without feature changes

## Design Principles

1. **Visibility-Only** - No new features, no automation
2. **Structured Data** - JSON logs, tagged metrics
3. **Correlation** - Request tracing throughout stack
4. **Non-Blocking** - Observability failures don't block requests
5. **Privacy-Aware** - No PII in logs/metrics

---

## 1. Structured Logging

### Requirements

- **Format**: JSON (machine-readable)
- **Library**: Winston (NestJS-compatible)
- **Levels**: ERROR, WARN, INFO, DEBUG
- **Context**: Correlation ID, user context, endpoint
- **Privacy**: No emails, no encrypted data

### Log Schema

```typescript
{
  timestamp: "2026-01-11T09:27:00.000Z",
  level: "INFO",
  message: "User registered successfully",
  correlationId: "uuid",
  service: "identity",
  method: "POST",
  endpoint: "/auth/register",
  accountabilityId: "uuid",  // Internal ID only
  personaId: "uuid",
  statusCode: 201,
  duration: 145,  // ms
  // NO email, NO displayName, NO IP addresses
}
```

### What to Log

**INFO Level**:
- User actions (register, login, post, report)
- Moderation actions (approve, reject, trust level change)
- Policy evaluations

**WARN Level**:
- Rate limit exceeded
- Duplicate report submission
- Policy limit reached (max personas)

**ERROR Level**:
- Database errors
- Validation failures
- Internal server errors

**DEBUG Level** (dev only):
- Repository queries
- Policy lookups
- Session reads

### Implementation

```typescript
// logger.service.ts
@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/app.log' })
      ]
    });
  }

  info(message: string, context: LogContext) {
    this.logger.info(message, { ...context });
  }

  warn(message: string, context: LogContext) {
    this.logger.warn(message, { ...context });
  }

  error(message: string, error: Error, context: LogContext) {
    this.logger.error(message, {
      ...context,
      error: error.message,
      stack: error.stack,
    });
  }
}
```

---

## 2. Core Metrics

### Metrics to Track

**Request Metrics**:
- `http_requests_total` - Total requests (by endpoint, method, status)
- `http_request_duration_ms` - Latency histogram (p50, p95, p99)
- `http_errors_total` - Error count (by type, endpoint)

**Business Metrics**:
- `identity_registrations_total` - User registrations
- `identity_logins_total` - Login attempts (success/failure)
- `identity_personas_created_total` - Persona creation
- `posts_created_total` - Post submissions
- `posts_deleted_total` - Post deletions
- `reports_submitted_total` - User reports (by category)
- `moderation_actions_total` - Admin actions (by type)

**System Metrics**:
- `moderation_queue_size` - Pending moderation items
- `trust_level_distribution` - NEW/REGULAR/TRUSTED counts
- `active_sessions` - Current user sessions
- `database_connections` - Prisma connection pool

### Metrics Format (Prometheus-compatible)

```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="POST",endpoint="/auth/register",status="201"} 142

# HELP http_request_duration_ms HTTP request duration
# TYPE http_request_duration_ms histogram
http_request_duration_ms_bucket{endpoint="/public/posts",le="50"} 120
http_request_duration_ms_bucket{endpoint="/public/posts",le="100"} 200
http_request_duration_ms_sum{endpoint="/public/posts"} 15234
http_request_duration_ms_count{endpoint="/public/posts"} 250

# HELP moderation_queue_size Moderation queue size
# TYPE moderation_queue_size gauge
moderation_queue_size{status="PENDING"} 47
```

### Implementation

```typescript
// metrics.service.ts
@Injectable()
export class MetricsService {
  private registry: Registry;
  
  // Counters
  private httpRequestsTotal: Counter;
  private registrationsTotal: Counter;
  private reportsTotal: Counter;
  
  // Histograms
  private httpDuration: Histogram;
  
  // Gauges
  private queueSize: Gauge;

  constructor() {
    this.registry = new Registry();
    this.initializeMetrics();
  }

  incrementRequests(method: string, endpoint: string, status: number) {
    this.httpRequestsTotal.inc({ method, endpoint, status });
  }

  recordDuration(endpoint: string, duration: number) {
    this.httpDuration.observe({ endpoint }, duration);
  }

  getMetrics(): string {
    return this.registry.metrics();
  }
}
```

---

## 3. Health Checks

### Endpoints

**Liveness Probe**: `/health/live`
- Returns 200 if application is running
- Used by Kubernetes/load balancer

**Readiness Probe**: `/health/ready`
- Returns 200 if app can serve traffic
- Checks: database connection, critical services

**Metrics Endpoint**: `/metrics`
- Returns Prometheus-compatible metrics
- Internal only (not public)

### Health Check Schema

```typescript
// GET /health/ready
{
  status: "healthy" | "degraded" | "unhealthy",
  timestamp: "2026-01-11T09:27:00.000Z",
  uptime: 3600,  // seconds
  checks: {
    database: {
      status: "healthy",
      responseTime:5,  // ms
    },
    prisma: {
      status: "healthy",
      connections: 5,
      maxConnections: 10,
    }
  }
}
```

---

## 4. Admin Dashboard Data

### Moderation Stats Endpoint

**GET `/internal/moderation/stats`**

```typescript
{
  queue: {
    pending: 47,
    reviewed: 342,
    averageReviewTime: 180,  // seconds
  },
  reports: {
    total: 128,
    byCategory: {
      SPAM: 45,
      HARASSMENT: 32,
      HATE_SPEECH: 15,
      OTHER: 36,
    },
    last24Hours: 23,
  },
  trustLevels: {
    NEW: 1245,
    REGULAR: 342,
    TRUSTED: 89,
  },
  riskLevels: {
    LOW: 1588,
    MEDIUM: 78,
    HIGH: 10,
  }
}
```

### System Stats Endpoint

**GET `/internal/system/stats`**

```typescript
{
  users: {
    total: 1676,
    registeredLast24Hours: 142,
    activePersonas: 2134,
  },
  content: {
    totalPosts: 5432,
    postsLast24Hours: 567,
    deletedPosts: 89,
  },
  activity: {
    loginRate: 234,  // per hour
    postRate: 56,    // per hour
    reportRate: 3,   // per hour
  }
}
```

---

## 5. Correlation ID Tracking

### Middleware

```typescript
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers['x-correlation-id'] || randomUUID();
    req['correlationId'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    next();
  }
}
```

### Usage Throughout Stack

```typescript
// Controller
@Post()
async register(@Req() req: Request) {
  const correlationId = req['correlationId'];
  
  this.logger.info('Registration started', {
    correlationId,
    endpoint: '/auth/register',
  });
  
  // ... business logic
  
  return {
    ...result,
    correlationId,  // Return to client for support requests
  };
}
```

---

## Implementation Structure

```
backend/src/observability/
├── services/
│   ├── logger.service.ts
│   ├── metrics.service.ts
│   └── health.service.ts
├── middleware/
│   ├── correlation-id.middleware.ts
│   └── metrics.middleware.ts
├── controllers/
│   ├── health.controller.ts
│   ├── metrics.controller.ts (internal)
│   └── stats.controller.ts (internal)
├── interfaces/
│   └── log-context.interface.ts
└── observability.module.ts
```

---

## Success Criteria

Observability is complete when:

1. ✅ All services emit structured JSON logs
2. ✅ Correlation IDs flow through all requests
3. ✅ Core metrics exposed at `/metrics`
4. ✅ Health checks respond at `/health/live` and `/health/ready`
5. ✅ Admin dashboard data available
6. ✅ No PII in logs or metrics
7. ✅ Observability failures don't block requests

---

## Privacy & Security

### What NOT to Log

❌ Email addresses  
❌ Passwords (obviously)  
❌ Encrypted data  
❌ Display names (persona PII)  
❌ IP addresses (unless required)  
❌ Session tokens

### What's Safe to Log

✅ Correlation IDs  
✅ Internal UUIDs (accountability ID, persona ID)  
✅ Endpoint names  
✅ HTTP status codes  
✅ Durations  
✅ Error types (not full stack in production)

---

## Deployment Considerations

### Log Storage

- **Development**: Console + local files
- **Production**: Centralized logging (CloudWatch, Datadog, ELK)
- **Retention**: 30 days (compliance)

### Metrics Collection

- **Development**: In-memory
- **Production**: Prometheus scraping `/metrics` every 15s
- **Visualization**: Grafana dashboards

### Alerting Rules (Future)

- Error rate > 1% (5min window)
- Response time p99 > 1000ms
- Moderation queue > 100 items
- Database connection pool exhausted

---

## Future Enhancements (Phase 2)

- Distributed tracing (OpenTelemetry)
- User session analytics
- A/B testing framework
- Real-time dashboard (WebSocket)
- Anomaly detection

---

**Version**: 1.0  
**Status**: Ready for implementation  
**Dependencies**: Winston, prom-client (npm packages)
