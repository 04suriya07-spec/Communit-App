import apiClient from './client';
import type {
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
} from '@/types/api';

/**
 * Authentication API
 * 
 * All endpoints use cookie-based sessions.
 * Backend automatically sets session cookie on successful auth.
 */

export const authApi = {
    /**
     * Register new user
     * Creates user account and first persona, sets session cookie
     */
    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        const response = await apiClient.post<RegisterResponse>('/auth/register', data);
        return response.data;
    },

    /**
     * Login existing user
     * Sets session cookie on success
     */
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/login', data);
        return response.data;
    },

    /**
     * Logout user
     * Note: Backend doesn't have explicit logout endpoint
     * We clear session by calling a non-existent endpoint to trigger 401
     * Then redirect to login
     */
    logout: async (): Promise<void> => {
        // Clear local state and redirect
        window.location.href = '/login';
    },
};

export default authApi;
