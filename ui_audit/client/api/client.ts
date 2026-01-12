import axios from 'axios';

/**
 * API Client for Community App
 * 
 * Configuration:
 * - Base URL from environment variable or defaults to production
 * - withCredentials: true enables cookie-based sessions
 * - Automatic 401 redirect to login page
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://community-app-render.onrender.com/api/v1';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // CRITICAL: Enables cookie-based sessions
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // 15 seconds
});

/**
 * Response interceptor
 * - Handles 401 Unauthorized by redirecting to login
 * - Prevents redirect loops by checking current path
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only redirect if not already on auth pages
            if (!window.location.pathname.startsWith('/login') &&
                !window.location.pathname.startsWith('/register')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
