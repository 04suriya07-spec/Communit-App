import React, { useState, useEffect } from 'react';
import { postsApi } from '@/api/posts';
import type { Post } from '@/types/api';
import PostCard from './PostCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw } from 'lucide-react';

interface PostFeedProps {
    refreshTrigger: number;
}

const PostFeed: React.FC<PostFeedProps> = ({ refreshTrigger }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPosts = async (reset: boolean = false) => {
        try {
            if (reset) {
                setIsLoading(true);
                setPosts([]);
                setNextCursor(undefined);
            } else {
                setIsLoadingMore(true);
            }

            setError(null);

            const response = await postsApi.getFeed({
                limit: 20,
                cursor: reset ? undefined : nextCursor,
            });

            if (reset) {
                setPosts(response.posts);
            } else {
                setPosts((prev) => [...prev, ...response.posts]);
            }

            setNextCursor(response.nextCursor);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load posts. Please try again.');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        loadPosts(true);
    }, [refreshTrigger]);

    const handlePostDeleted = (postId: string) => {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
        );
    }

    if (error && posts.length === 0) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    {error}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadPosts(true)}
                        className="ml-4"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-600 mb-4">
                    No posts yet. Be the first to share something!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    onPostDeleted={handlePostDeleted}
                />
            ))}

            {nextCursor && (
                <div className="text-center pt-4">
                    <Button
                        variant="outline"
                        onClick={() => loadPosts(false)}
                        disabled={isLoadingMore}
                    >
                        {isLoadingMore ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            'Load More'
                        )}
                    </Button>
                </div>
            )}

            {!nextCursor && posts.length > 0 && (
                <p className="text-center text-sm text-gray-500 py-4">
                    You've reached the end
                </p>
            )}
        </div>
    );
};

export default PostFeed;
