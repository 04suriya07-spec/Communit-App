import React, { useEffect, useRef, useCallback } from 'react';
import { CommunityCard } from './CommunityCard';
import { useCommunities } from '../hooks/useCommunities';
import type { Community } from '../api/communities';

interface CommunityListProps {
    searchQuery?: string;
    type?: 'private' | 'public_restricted' | 'public_open';
}

const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 animate-pulse">
        <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3" />
        <div className="flex gap-4 mb-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
        <div className="flex gap-2">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
        </div>
    </div>
);

export const CommunityList: React.FC<CommunityListProps> = ({ searchQuery, type }) => {
    const { communities, loading, error, fetchCommunities, followCommunity, unfollowCommunity, joinCommunity } = useCommunities();
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchCommunities({ search: searchQuery, type });
    }, [searchQuery, type, fetchCommunities]);

    const handleFollow = useCallback(async (community: Community) => {
        try {
            if (community.isFollowing) {
                await unfollowCommunity(community.id);
            } else {
                await followCommunity(community.id);
            }
        } catch (err) {
            console.error('Failed to toggle follow:', err);
        }
    }, [followCommunity, unfollowCommunity]);

    const handleJoin = useCallback(async (community: Community) => {
        try {
            const result = await joinCommunity(community.id);
            if (result.status === 'requested') {
                // TODO: Show toast notification
                console.log('Join request sent');
            } else {
                // TODO: Show success toast
                console.log('Joined community');
            }
        } catch (err) {
            console.error('Failed to join:', err);
        }
    }, [joinCommunity]);

    if (loading && communities.length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button
                    onClick={() => fetchCommunities({ search: searchQuery, type })}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (communities.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-2">No communities found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                    {searchQuery ? 'Try a different search term' : 'Be the first to create one!'}
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {communities.map((community) => (
                    <CommunityCard
                        key={community.id}
                        community={community}
                        onFollow={() => handleFollow(community)}
                        onJoin={() => handleJoin(community)}
                        showActions={true}
                    />
                ))}
            </div>

            {/* Load more trigger */}
            <div ref={loadMoreRef} className="h-4 mt-4" aria-hidden="true" />
        </div>
    );
};
