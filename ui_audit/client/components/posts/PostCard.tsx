import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { postsApi } from '@/api/posts';
import type { Post } from '@/types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
    post: Post;
    onPostDeleted: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onPostDeleted }) => {
    const { currentPersona } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isOwnPost = currentPersona?.id === post.author.personaId;

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            setIsDeleting(true);
            setError(null);
            await postsApi.delete(post.id);
            onPostDeleted(post.id);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete post. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const formattedTime = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

    return (
        <Card>
            <CardContent className="pt-6">
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium text-sm text-gray-900">
                                {post.author.displayName}
                            </p>
                            <p className="text-xs text-gray-500">{formattedTime}</p>
                        </div>
                    </div>

                    {isOwnPost && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <p className="text-gray-800 whitespace-pre-wrap break-words">
                    {post.body}
                </p>
            </CardContent>
        </Card>
    );
};

export default PostCard;
