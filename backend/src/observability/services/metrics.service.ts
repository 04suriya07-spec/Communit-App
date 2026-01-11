import { Injectable } from '@nestjs/common';
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

/**
 * Metrics Service
 * 
 * Prometheus-compatible metrics for observability
 */
@Injectable()
export class MetricsService {
    private registry: Registry;

    // HTTP Metrics
    private httpRequestsTotal: Counter;
    private httpRequestDuration: Histogram;
    private httpErrorsTotal: Counter;

    // Business Metrics
    private registrationsTotal: Counter;
    private loginsTotal: Counter;
    private personasCreatedTotal: Counter;
    private postsCreatedTotal: Counter;
    private postsDeletedTotal: Counter;
    private reportsSubmittedTotal: Counter;
    private moderationActionsTotal: Counter;

    // System Metrics
    private moderationQueueSize: Gauge;
    private trustLevelDistribution: Gauge;
    private activeSessions: Gauge;

    constructor() {
        this.registry = new Registry();
        this.initializeMetrics();
    }

    private initializeMetrics() {
        // HTTP Request Counter
        this.httpRequestsTotal = new Counter({
            name: 'http_requests_total',
            help: 'Total HTTP requests',
            labelNames: ['method', 'endpoint', 'status'],
            registers: [this.registry],
        });

        // HTTP Request Duration
        this.httpRequestDuration = new Histogram({
            name: 'http_request_duration_ms',
            help: 'HTTP request duration in milliseconds',
            labelNames: ['endpoint'],
            buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
            registers: [this.registry],
        });

        // HTTP Errors
        this.httpErrorsTotal = new Counter({
            name: 'http_errors_total',
            help: 'Total HTTP errors',
            labelNames: ['endpoint', 'error_type'],
            registers: [this.registry],
        });

        // Registrations
        this.registrationsTotal = new Counter({
            name: 'identity_registrations_total',
            help: 'Total user registrations',
            registers: [this.registry],
        });

        // Logins
        this.loginsTotal = new Counter({
            name: 'identity_logins_total',
            help: 'Total login attempts',
            labelNames: ['status'], // success/failure
            registers: [this.registry],
        });

        // Personas Created
        this.personasCreatedTotal = new Counter({
            name: 'identity_personas_created_total',
            help: 'Total personas created',
            registers: [this.registry],
        });

        // Posts Created
        this.postsCreatedTotal = new Counter({
            name: 'posts_created_total',
            help: 'Total posts created',
            registers: [this.registry],
        });

        // Posts Deleted
        this.postsDeletedTotal = new Counter({
            name: 'posts_deleted_total',
            help: 'Total posts deleted',
            registers: [this.registry],
        });

        // Reports Submitted
        this.reportsSubmittedTotal = new Counter({
            name: 'reports_submitted_total',
            help: 'Total reports submitted',
            labelNames: ['category'],
            registers: [this.registry],
        });

        // Moderation Actions
        this.moderationActionsTotal = new Counter({
            name: 'moderation_actions_total',
            help: 'Total moderation actions',
            labelNames: ['action'], // APPROVE, REJECT, FLAG, etc.
            registers: [this.registry],
        });

        // Moderation Queue Size
        this.moderationQueueSize = new Gauge({
            name: 'moderation_queue_size',
            help: 'Current moderation queue size',
            labelNames: ['status'], // PENDING, REVIEWED
            registers: [this.registry],
        });

        // Trust Level Distribution
        this.trustLevelDistribution = new Gauge({
            name: 'trust_level_distribution',
            help: 'Distribution of trust levels',
            labelNames: ['level'], // NEW, REGULAR, TRUSTED
            registers: [this.registry],
        });

        // Active Sessions
        this.activeSessions = new Gauge({
            name: 'active_sessions',
            help: 'Number of active user sessions',
            registers: [this.registry],
        });
    }

    // HTTP Metrics
    incrementRequests(method: string, endpoint: string, status: number) {
        this.httpRequestsTotal.inc({ method, endpoint, status: status.toString() });
    }

    recordDuration(endpoint: string, duration: number) {
        this.httpRequestDuration.observe({ endpoint }, duration);
    }

    incrementErrors(endpoint: string, errorType: string) {
        this.httpErrorsTotal.inc({ endpoint, error_type: errorType });
    }

    // Business Metrics
    incrementRegistrations() {
        this.registrationsTotal.inc();
    }

    incrementLogins(status: 'success' | 'failure') {
        this.loginsTotal.inc({ status });
    }

    incrementPersonasCreated() {
        this.personasCreatedTotal.inc();
    }

    incrementPostsCreated() {
        this.postsCreatedTotal.inc();
    }

    incrementPostsDeleted() {
        this.postsDeletedTotal.inc();
    }

    incrementReportsSubmitted(category: string) {
        this.reportsSubmittedTotal.inc({ category });
    }

    incrementModerationActions(action: string) {
        this.moderationActionsTotal.inc({ action });
    }

    // System Metrics
    setModerationQueueSize(status: string, size: number) {
        this.moderationQueueSize.set({ status }, size);
    }

    setTrustLevelDistribution(level: string, count: number) {
        this.trustLevelDistribution.set({ level }, count);
    }

    setActiveSessions(count: number) {
        this.activeSessions.set(count);
    }

    // Get metrics in Prometheus format
    async getMetrics(): Promise<string> {
        return this.registry.metrics();
    }
}
