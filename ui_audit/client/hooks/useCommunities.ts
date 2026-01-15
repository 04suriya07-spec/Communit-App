import { useState, useCallback } from 'react';
import { communitiesApi, Community, CreateCommunityDto, ListCommunitiesParams } from '../api/communities';

interface UseCommunities {
    communities: Community[];
    loading: boolean;
    error: string | null;
    fetchCommunities: (params?: ListCommunitiesParams) => Promise<void>;
    createCommunity: (data: CreateCommunityDto) => Promise<Community>;
    followCommunity: (id: string) => Promise<void>;
    unfollowCommunity: (id: string) => Promise<void>;
    joinCommunity: (id: string, message?: string) => Promise<{ status: 'joined' | 'requested'; requestId?: string }>;
    leaveCommunity: (id: string) => Promise<void>;
}

export const useCommunities = (): UseCommunities => {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCommunities = useCallback(async (params?: ListCommunitiesParams) => {
        setLoading(true);
        setError(null);
        try {
            const response = await communitiesApi.list(params);
            setCommunities(response.communities);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch communities');
        } finally {
            setLoading(false);
        }
    }, []);

    const createCommunity = useCallback(async (data: CreateCommunityDto): Promise<Community> => {
        setError(null);
        try {
            const community = await communitiesApi.create(data);
            setCommunities((prev) => [community, ...prev]);
            return community;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to create community';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    const followCommunity = useCallback(async (id: string) => {
        // Optimistic update
        setCommunities((prev) =>
            prev.map((c) =>
                c.id === id
                    ? { ...c, isFollowing: true, followerCount: c.followerCount + 1 }
                    : c
            )
        );

        try {
            await communitiesApi.follow(id);
        } catch (err: any) {
            // Revert on error
            setCommunities((prev) =>
                prev.map((c) =>
                    c.id === id
                        ? { ...c, isFollowing: false, followerCount: c.followerCount - 1 }
                        : c
                )
            );
            setError(err.response?.data?.message || 'Failed to follow community');
            throw err;
        }
    }, []);

    const unfollowCommunity = useCallback(async (id: string) => {
        // Optimistic update
        setCommunities((prev) =>
            prev.map((c) =>
                c.id === id
                    ? { ...c, isFollowing: false, followerCount: c.followerCount - 1 }
                    : c
            )
        );

        try {
            await communitiesApi.unfollow(id);
        } catch (err: any) {
            // Revert on error
            setCommunities((prev) =>
                prev.map((c) =>
                    c.id === id
                        ? { ...c, isFollowing: true, followerCount: c.followerCount + 1 }
                        : c
                )
            );
            setError(err.response?.data?.message || 'Failed to unfollow community');
            throw err;
        }
    }, []);

    const joinCommunity = useCallback(async (id: string, message?: string) => {
        try {
            const result = await communitiesApi.join(id, message);

            // Update community state
            if (result.status === 'joined') {
                setCommunities((prev) =>
                    prev.map((c) =>
                        c.id === id
                            ? { ...c, isMember: true, memberCount: c.memberCount + 1, userRole: 'member' }
                            : c
                    )
                );
            }

            return result;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to join community');
            throw err;
        }
    }, []);

    const leaveCommunity = useCallback(async (id: string) => {
        try {
            await communitiesApi.leave(id);

            setCommunities((prev) =>
                prev.map((c) =>
                    c.id === id
                        ? { ...c, isMember: false, memberCount: c.memberCount - 1, userRole: undefined }
                        : c
                )
            );
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to leave community');
            throw err;
        }
    }, []);

    return {
        communities,
        loading,
        error,
        fetchCommunities,
        createCommunity,
        followCommunity,
        unfollowCommunity,
        joinCommunity,
        leaveCommunity,
    };
};
