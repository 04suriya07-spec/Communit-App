/**
 * TypeScript types for Community App API
 * 
 * These types match the VERIFIED backend endpoints.
 * DO NOT add types for unimplemented features.
 */

// ============================================================
// AUTH TYPES
// ============================================================

export interface RegisterRequest {
    email: string;
    password: string;
    initialDisplayName: string;
}

export interface RegisterResponse {
    personaId: string;
    displayName: string;
    correlationId: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    personaId: string;
    displayName: string;
    correlationId: string;
}

// ============================================================
// PERSONA TYPES
// ============================================================

export type TrustLevel = 'NEW' | 'REGULAR' | 'TRUSTED';

export interface Persona {
    id: string;
    displayName: string;
    avatarUrl?: string;
    trustLevel: TrustLevel;
    createdAt: string;
}

export interface ListPersonasResponse {
    personas: Persona[];
    correlationId: string;
}

export interface CreatePersonaRequest {
    displayName: string;
    avatarUrl?: string;
}

export interface CreatePersonaResponse {
    persona: Persona;
    correlationId: string;
}

export interface RotatePersonaRequest {
    newDisplayName: string;
}

export interface RotatePersonaResponse {
    persona: Persona;
    correlationId: string;
}

// ============================================================
// POST TYPES
// ============================================================

export interface CreatePostRequest {
    personaId: string;
    body: string;
}

export interface CreatePostResponse {
    postId: string;
    createdAt: string;
    correlationId: string;
}

export interface PostAuthor {
    personaId: string;
    displayName: string;
}

export interface Post {
    id: string;
    body: string;
    author: PostAuthor;
    createdAt: string;
}

export interface GetPublicFeedResponse {
    posts: Post[];
    nextCursor?: string;
    correlationId: string;
}

export interface DeletePostResponse {
    deletedAt: string;
    correlationId: string;
}

// ============================================================
// ERROR TYPES
// ============================================================

export interface ApiError {
    message: string;
    statusCode?: number;
    error?: string;
}
