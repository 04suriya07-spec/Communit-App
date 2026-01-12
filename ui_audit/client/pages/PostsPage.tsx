import React, { useState } from 'react';
import PersonaSelector from '@/components/personas/PersonaSelector';
import CreatePostForm from '@/components/posts/CreatePostForm';
import PostFeed from '@/components/posts/PostFeed';

const PostsPage: React.FC = () => {
    const [feedRefreshTrigger, setFeedRefreshTrigger] = useState(0);

    const handlePostCreated = () => {
        setFeedRefreshTrigger((prev) => prev + 1);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Public Feed</h2>
                <PersonaSelector />
            </div>

            <CreatePostForm onPostCreated={handlePostCreated} />

            <PostFeed refreshTrigger={feedRefreshTrigger} />
        </div>
    );
};

export default PostsPage;
