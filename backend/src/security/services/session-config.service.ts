import { Injectable } from '@nestjs/common';
import session from 'express-session';
import Redis from 'ioredis';

// Use require to bypass TypeScript's incorrect type definitions for connect-redis v7
const ConnectRedis = require('connect-redis');

/**
 * Session Configuration Service
 * 
 * Provides Redis-backed sessions with rotation and expiry
 */
@Injectable()
export class SessionConfigService {
    private redisClient: Redis;
    private RedisStore: any;

    constructor() {
        // Redis client for sessions
        this.redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                if (times > 3) return null;
                return Math.min(times * 50, 2000);
            },
        });

        // Initialize RedisStore (connect-redis v7 uses factory pattern)
        this.RedisStore = ConnectRedis(session);
    }

    /**
     * Get user session middleware configuration
     */
    getUserSessionMiddleware() {
        return session({
            store: new this.RedisStore({
                client: this.redisClient,
                prefix: 'sess:user:',
                ttl: 86400, // 24 hours absolute expiry
            }),
            name: 'sessionId', // Don't use default 'connect.sid'
            secret: process.env.SESSION_SECRET || 'CHANGE_THIS_IN_PRODUCTION',
            resave: false,
            saveUninitialized: false,
            rolling: true, // Refresh session on activity (idle timeout)
            cookie: {
                secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
                httpOnly: true, // Prevent XSS
                maxAge: 1800000, // 30 minutes idle timeout
                sameSite: 'strict', // CSRF protection
            },
        });
    }

    /**
     * Get admin session middleware configuration
     * Separate store for admin isolation
     */
    getAdminSessionMiddleware() {
        return session({
            store: new this.RedisStore({
                client: this.redisClient,
                prefix: 'sess:admin:',
                ttl: 3600, // 1 hour absolute expiry (shorter for admins)
            }),
            name: 'adminSessionId',
            secret: process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET || 'CHANGE_THIS',
            resave: false,
            saveUninitialized: false,
            rolling: true,
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 900000, // 15 minutes idle timeout (stricter for admins)
                sameSite: 'strict',
                path: '/api/v1/internal', // Admin routes only
            },
        });
    }

    /**
     * Session fingerprint for security
     * Binds session to IP + User-Agent
     */
    generateFingerprint(req: any): string {
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'] || '';
        return `${ip}:${userAgent}`;
    }

    /**
     * Validate session fingerprint
     * Detects session hijacking
     */
    validateFingerprint(req: any, storedFingerprint: string): boolean {
        const currentFingerprint = this.generateFingerprint(req);
        return currentFingerprint === storedFingerprint;
    }

    /**
     * Rotate session (regenerate session ID)
     * Call after privilege escalation (login, admin actions)
     */
    async rotateSession(req: any): Promise<void> {
        return new Promise((resolve, reject) => {
            const oldData = { ...req.session };

            req.session.regenerate((err: any) => {
                if (err) return reject(err);

                // Restore session data after regeneration
                Object.assign(req.session, oldData);

                // Update fingerprint
                req.session.fingerprint = this.generateFingerprint(req);

                resolve();
            });
        });
    }

    /**
     * Destroy session (logout)
     */
    async destroySession(req: any): Promise<void> {
        return new Promise((resolve, reject) => {
            req.session.destroy((err: any) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    /**
     * Get Redis client (for health checks)
     */
    getRedisClient(): Redis {
        return this.redisClient;
    }
}
