import apiClient from './client';
import type {
    CreatePostRequest,
    CreatePostResponse,
    GetPublicFeedResponse,
    DeletePostResponse,
} from '@/types/api';

/**
 * Public Posts API
 */

export const postsApi = {
    /**
     * Create new public post
     * Requires authentication
     */
    create: async (data: CreatePostRequest): Promise<CreatePostResponse> => {
        const response = await apiClient.post<CreatePostResponse>('/public/posts', data);
        return response.data;
    },

    /**
     * Get public feed
     * - Supports cursor-based pagination
     * - Does NOT require authentication (public feed)
     */
    getFeed: async (params?: { limit?: number; cursor?: string }): Promise<GetPublicFeedResponse> => {
        const response = await apiClient.get<GetPublicFeedResponse>('/public/posts', {
            params,
        });
        return response.data;
    },

    /**
     * Delete own post
     * Requires authentication
     */
    delete: async (postId: string): Promise<DeletePostResponse> => {
        const response = await apiClient.delete<DeletePostResponse>(`/public/posts/${postId}`);
        return response.data;
    },
};

export default postsApi;
