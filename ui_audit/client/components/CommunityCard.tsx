import React from 'react';
import { Users, Heart, Lock, Shield, Globe } from 'lucide-react';
import type { Community } from '../api/communities';

interface CommunityCardProps {
    community: Community;
    onFollow?: () => void;
    onJoin?: () => void;
    showActions?: boolean;
}

const TypeBadge: React.FC<{ type: Community['type'] }> = ({ type }) => {
    const badges = {
        private: {
            icon: <Lock size={14} />,
            label: 'Private',
            className: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        },
        public_restricted: {
            icon: <Shield size={14} />,
            label: 'Restricted',
            className: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
        },
        public_open: {
            icon: <Globe size={14} />,
            label: 'Open',
            className: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
        },
    };

    const badge = badges[type];

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}
            aria-label={`Community type: ${badge.label}`}
        >
            {badge.icon}
            <span>{badge.label}</span>
        </span>
    );
};

export const CommunityCard: React.FC<CommunityCardProps> = ({
    community,
    onFollow,
    onJoin,
    showActions = true,
}) => {
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {community.avatarUrl ? (
                        <img
                            src={community.avatarUrl}
                            alt={`${community.name} avatar`}
                            className="w-full h-full rounded-lg object-cover"
                        />
                    ) : (
                        community.name.charAt(0).toUpperCase()
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {community.name}
                    </h3>
                    <TypeBadge type={community.type} />
                </div>
            </div>

            {/* Description */}
            {community.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {community.description}
                </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 mb-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1" aria-label={`${community.memberCount} members`}>
                    <Users size={16} />
                    <span>{community.memberCount}</span>
                </div>
                <div className="flex items-center gap-1" aria-label={`${community.followerCount} followers`}>
                    <Heart size={16} />
                    <span>{community.followerCount}</span>
                </div>
            </div>

            {/* Actions */}
            {showActions && (
                <div className="flex gap-2">
                    {onFollow && (
                        <button
                            onClick={onFollow}
                            className={`
                                flex-1 px-4 py-2 rounded-lg text-sm font-medium
                                transition-colors
                                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                                ${community.isFollowing
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                                }
                            `}
                            aria-pressed={community.isFollowing}
                        >
                            {community.isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                    {onJoin && !community.isMember && (
                        <button
                            onClick={onJoin}
                            className="
                                flex-1 px-4 py-2 rounded-lg text-sm font-medium
                                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                border border-gray-300 dark:border-gray-700
                                hover:bg-gray-50 dark:hover:bg-gray-700
                                transition-colors
                                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                            "
                        >
                            {community.type === 'public_open' ? 'Join' : 'Request to Join'}
                        </button>
                    )}
                    {community.isMember && (
                        <span className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-center">
                            Member
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};
