import { Injectable } from '@nestjs/common';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

/**
 * Rate Limit Configuration Service
 * 
 * Provides Redis-backed rate limiting for IP and session-based throttling
 * Phase C2: Fail-closed, separate limits for auth vs content
 */
@Injectable()
export class RateLimitConfigService {
    private redisClient: Redis;

    constructor() {
        // Redis client for rate limiting
        this.redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            maxRetriesPerRequest: 3,
            retryStrategy: (times: number) => {
                if (times > 3) return null; // Fail-closed: block if Redis unavailable
                return Math.min(times * 50, 2000);
            },
        });
    }

    /**
     * Auth endpoints rate limiter (stricter)
     * Protects: /auth/register, /auth/login
     */
    getAuthRateLimiter() {
        return rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5, // 5 attempts per window per IP
            standardHeaders: true,
            legacyHeaders: false,
            store: new RedisStore({
                // @ts-expect-error - rate-limit-redis types issue
                sendCommand: (...args: any[]) => this.redisClient.call(...args),
                prefix: 'rl:auth:',
            }),
            message: {
                error: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many authentication attempts. Please try again later.',
                retryAfter: 900, // seconds
            },
            skipSuccessfulRequests: false, // Count all requests
            skipFailedRequests: false,
        });
    }

    /**
     * Content endpoints rate limiter (moderate)
     * Protects: /public/posts, /reports
     */
    getContentRateLimiter() {
        return rateLimit({
            windowMs: 60 * 1000, // 1 minute
            max: 30, // 30 requests per minute per IP
            standardHeaders: true,
            legacyHeaders: false,
            store: new RedisStore({
                // @ts-expect-error - rate-limit-redis types issue
                sendCommand: (...args: any[]) => this.redisClient.call(...args),
                prefix: 'rl:content:',
            }),
            message: {
                error: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests. Please slow down.',
                retryAfter: 60,
            },
        });
    }

    /**
     * General API rate limiter (permissive)
     * Protects: all other endpoints
     */
    getGeneralRateLimiter() {
        return rateLimit({
            windowMs: 60 * 1000, // 1 minute
            max: 100, // 100 requests per minute per IP
            standardHeaders: true,
            legacyHeaders: false,
            store: new RedisStore({
                // @ts-expect-error - rate-limit-redis types issue
                sendCommand: (...args: any[]) => this.redisClient.call(...args),
                prefix: 'rl:general:',
            }),
            message: {
                error: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests.',
                retryAfter: 60,
            },
        });
    }

    /**
     * Admin endpoints rate limiter (moderate but logged)
     * Protects: /internal/moderation/*
     */
    getAdminRateLimiter() {
        return rateLimit({
            windowMs: 60 * 1000,
            max: 50, // 50 requests per minute
            standardHeaders: true,
            legacyHeaders: false,
            store: new RedisStore({
                // @ts-expect-error - rate-limit-redis types issue
                sendCommand: (...args: any[]) => this.redisClient.call(...args),
                prefix: 'rl:admin:',
            }),
            message: {
                error: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many admin requests.',
                retryAfter: 60,
            },
        });
    }

    /**
     * Session-based rate limiter
     * Uses session ID instead of IP for authenticated users
     */
    getSessionRateLimiter(windowMs: number, max: number, prefix: string) {
        return rateLimit({
            windowMs,
            max,
            standardHeaders: true,
            legacyHeaders: false,
            store: new RedisStore({
                // @ts-expect-error - rate-limit-redis types issue
                sendCommand: (...args: any[]) => this.redisClient.call(...args),
                prefix: `rl:sess:${prefix}:`,
            }),
            keyGenerator: (req: any) => {
                // Use session ID if available, otherwise IP
                return req.session?.id || req.ip || 'unknown';
            },
            message: {
                error: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests from your session.',
                retryAfter: Math.floor(windowMs / 1000),
            },
        });
    }

    /**
     * Get Redis client for health checks
     */
    getRedisClient(): Redis {
        return this.redisClient;
    }
}
