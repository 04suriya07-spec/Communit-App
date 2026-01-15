import apiClient from './client';

export interface Community {
    id: string;
    slug: string;
    name: string;
    description?: string;
    type: 'private' | 'public_restricted' | 'public_open';
    avatarUrl?: string;
    bannerUrl?: string;
    memberCount: number;
    followerCount: number;
    createdAt: string;
    updatedAt: string;
    userRole?: 'owner' | 'admin' | 'moderator' | 'member' | 'follower' | 'guest';
    isFollowing: boolean;
    isMember: boolean;
}

export interface CreateCommunityDto {
    name: string;
    description?: string;
    type: 'private' | 'public_restricted' | 'public_open';
    slug?: string;
    avatarUrl?: string;
    bannerUrl?: string;
}

export interface ListCommunitiesParams {
    type?: 'private' | 'public_restricted' | 'public_open';
    search?: string;
    limit?: number;
    cursor?: string;
}

export interface ListCommunitiesResponse {
    communities: Community[];
    pagination: {
        total: number;
        limit: number;
        cursor: string | null;
        hasMore: boolean;
    };
}

export const communitiesApi = {
    // Phase 1
    create: async (data: CreateCommunityDto): Promise<Community> => {
        const response = await apiClient.post('/communities', data);
        return response.data;
    },

    list: async (params?: ListCommunitiesParams): Promise<ListCommunitiesResponse> => {
        const response = await apiClient.get('/communities', { params });
        return response.data;
    },

    getById: async (id: string): Promise<Community> => {
        const response = await apiClient.get(`/communities/${id}`);
        return response.data;
    },

    // Phase 2 - Follow System
    follow: async (id: string): Promise<void> => {
        await apiClient.post(`/communities/${id}/follow`);
    },

    unfollow: async (id: string): Promise<void> => {
        await apiClient.post(`/communities/${id}/unfollow`);
    },

    getFollowing: async (): Promise<Community[]> => {
        const response = await apiClient.get('/communities/following/me');
        return response.data;
    },

    // Phase 2 - Join Workflow
    join: async (id: string, message?: string): Promise<{ status: 'joined' | 'requested'; requestId?: string }> => {
        const response = await apiClient.post(`/communities/${id}/join`, { message });
        return response.data;
    },

    leave: async (id: string): Promise<void> => {
        await apiClient.post(`/communities/${id}/leave`);
    },

    // Phase 2 - Member Management
    getMembers: async (id: string): Promise<any[]> => {
        const response = await apiClient.get(`/communities/${id}/members`);
        return response.data;
    },

    changeMemberRole: async (id: string, userId: string, role: string): Promise<void> => {
        await apiClient.post(`/communities/${id}/members/${userId}/role`, { role });
    },

    removeMember: async (id: string, userId: string): Promise<void> => {
        await apiClient.post(`/communities/${id}/members/${userId}/remove`);
    },

    // Phase 2 - Community Management
    update: async (id: string, updates: Partial<CreateCommunityDto>): Promise<Community> => {
        const response = await apiClient.post(`/communities/${id}/update`, updates);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.post(`/communities/${id}/delete`);
    },
};
