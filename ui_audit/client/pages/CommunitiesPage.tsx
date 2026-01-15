import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { CommunityList } from '../components/CommunityList';
import { CreateCommunityModal } from '../components/CreateCommunityModal';

export const CommunitiesPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'private' | 'public_restricted' | 'public_open' | undefined>();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Explore Communities
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Discover and join communities that match your interests
                </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search communities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="
                            w-full pl-10 pr-4 py-2 rounded-lg
                            border border-gray-300 dark:border-gray-700
                            bg-white dark:bg-gray-800
                            text-gray-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-purple-500
                        "
                        aria-label="Search communities"
                    />
                </div>

                {/* Type Filter */}
                <select
                    value={typeFilter || ''}
                    onChange={(e) => setTypeFilter(e.target.value as any || undefined)}
                    className="
                        px-4 py-2 rounded-lg
                        border border-gray-300 dark:border-gray-700
                        bg-white dark:bg-gray-800
                        text-gray-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-purple-500
                    "
                    aria-label="Filter by community type"
                >
                    <option value="">All Types</option>
                    <option value="public_open">Public Open</option>
                    <option value="public_restricted">Public Restricted</option>
                    <option value="private">Private</option>
                </select>

                {/* Create Button */}
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="
                        flex items-center gap-2 px-4 py-2 rounded-lg
                        bg-purple-600 text-white
                        hover:bg-purple-700
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                        transition-colors
                    "
                    aria-label="Create new community"
                >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Create</span>
                </button>
            </div>

            {/* Community List */}
            <CommunityList searchQuery={searchQuery} type={typeFilter} />

            {/* Create Modal */}
            <CreateCommunityModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    // Refresh list
                    setSearchQuery('');
                    setTypeFilter(undefined);
                }}
            />
        </div>
    );
};
