/**
 * API Client for Community App Backend
 * 
 * PRIVACY RULES:
 * - NEVER expose accountabilityProfileId
 * - NEVER expose authProfileId
 * - ALWAYS use personaId for public actions
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/v1';

interface Persona {
    id: string;
    displayName: string;
    avatarUrl?: string;
    isActive: boolean;
    createdAt: string;
}

interface Post {
    id: string;
    body: string;
    author: {
        personaId: string;
        displayName: string;
    };
    createdAt: string;
}

interface ApiError {
    message: string;
    statusCode: number;
}

class ApiClient {
    private async fetchWithAuth(url: string, options: RequestInit = {}) {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            credentials: 'include', // Send session cookies
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error: ApiError = await response.json().catch(() => ({
                message: 'Unknown error',
                statusCode: response.status,
            }));
            throw new Error(error.message);
        }

        return response.json();
    }

    // ============================================================
    // AUTH API
    // ============================================================

    async register(data: { email: string; password: string; initialDisplayName: string }) {
        return this.fetchWithAuth('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async login(data: { email: string; password: string }) {
        return this.fetchWithAuth('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // ============================================================
    // IDENTITY & PERSONA API
    // ============================================================

    async getPersonas(): Promise<Persona[]> {
        return this.fetchWithAuth('/personas');
    }

    async createPersona(displayName: string): Promise<Persona> {
        return this.fetchWithAuth('/personas', {
            method: 'POST',
            body: JSON.stringify({ displayName }),
        });
    }

    async rotatePersona(personaId: string, newDisplayName: string): Promise<Persona> {
        return this.fetchWithAuth(`/personas/${personaId}/rotate`, {
            method: 'POST',
            body: JSON.stringify({ newDisplayName }),
        });
    }

    // ============================================================
    // PUBLIC POSTING API
    // ============================================================

    async getPublicFeed(limit = 20, cursor?: string): Promise<{ posts: Post[]; nextCursor?: string }> {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (cursor) params.append('cursor', cursor);
        return this.fetchWithAuth(`/public/posts?${params}`);
    }

    async createPost(personaId: string, body: string): Promise<{ postId: string; createdAt: string }> {
        return this.fetchWithAuth('/public/posts', {
            method: 'POST',
            body: JSON.stringify({ personaId, body }),
        });
    }

    async deletePost(postId: string): Promise<{ deletedAt: string }> {
        return this.fetchWithAuth(`/public/posts/${postId}`, {
            method: 'DELETE',
        });
    }

    // ============================================================
    // REPORTING API
    // ============================================================

    async submitReport(data: {
        targetId: string;
        targetType: 'POST' | 'PERSONA';
        category: string;
        reporterPersonaId: string;
    }): Promise<{ submitted: boolean; message: string }> {
        return this.fetchWithAuth('/reports', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // ============================================================
    // MODERATION API (ADMIN ONLY)
    // ============================================================

    async getModerationQueue(): Promise<any[]> {
        return this.fetchWithAuth('/moderation/queue');
    }

    async moderateContent(data: {
        targetId: string;
        action: 'APPROVE' | 'REJECT';
        reason: string;
    }): Promise<void> {
        return this.fetchWithAuth('/moderation/action', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

export const api = new ApiClient();
export type { Persona, Post };
