import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Compass,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    Plus,
} from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    to: string;
    badge?: number;
}

interface SidebarProps {
    className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [communitiesExpanded, setCommunitiesExpanded] = useState(true);
    const location = useLocation();
    const sidebarRef = useRef<HTMLElement>(null);

    const navItems: NavItem[] = [
        { id: 'home', label: 'Home', icon: <Home size={20} />, to: '/app/posts' },
        { id: 'explore', label: 'Explore', icon: <Compass size={20} />, to: '/communities' },
        { id: 'my-communities', label: 'My Communities', icon: <Users size={20} />, to: '/communities/mine' },
        { id: 'settings', label: 'Settings', icon: <Settings size={20} />, to: '/settings' },
    ];

    const isActive = (path: string) => location.pathname === path;

    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            action();
        }
    };

    return (
        <aside
            ref={sidebarRef}
            className={`
                ${isCollapsed ? 'w-16' : 'w-64'}
                bg-white dark:bg-gray-900 
                border-r border-gray-200 dark:border-gray-800
                transition-all duration-300 ease-in-out
                flex flex-col
                h-screen
                sticky top-0
                ${className}
            `}
            role="navigation"
            aria-label="Main navigation"
        >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
                {!isCollapsed && (
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        Community
                    </h1>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    onKeyDown={(e) => handleKeyDown(e, () => setIsCollapsed(!isCollapsed))}
                    className="
                        p-2 rounded-lg
                        hover:bg-gray-100 dark:hover:bg-gray-800
                        focus:outline-none focus:ring-2 focus:ring-purple-500
                        transition-colors
                    "
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    aria-expanded={!isCollapsed}
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-2">
                <ul className="space-y-1">
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <Link
                                to={item.to}
                                className={`
                                    flex items-center gap-3 px-3 py-2 rounded-lg
                                    transition-colors
                                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                                    ${isActive(item.to)
                                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }
                                `}
                                aria-current={isActive(item.to) ? 'page' : undefined}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <span className="flex-shrink-0">{item.icon}</span>
                                {!isCollapsed && (
                                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                                )}
                                {!isCollapsed && item.badge && (
                                    <span className="px-2 py-0.5 text-xs font-semibold bg-purple-600 text-white rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Communities Section */}
                {!isCollapsed && (
                    <div className="mt-6">
                        <button
                            onClick={() => setCommunitiesExpanded(!communitiesExpanded)}
                            onKeyDown={(e) => handleKeyDown(e, () => setCommunitiesExpanded(!communitiesExpanded))}
                            className="
                                w-full flex items-center justify-between px-3 py-2
                                text-sm font-semibold text-gray-600 dark:text-gray-400
                                hover:text-gray-900 dark:hover:text-gray-200
                                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                                rounded-lg
                            "
                            aria-expanded={communitiesExpanded}
                            aria-controls="communities-list"
                        >
                            <span>Communities</span>
                            <ChevronRight
                                size={16}
                                className={`transform transition-transform ${communitiesExpanded ? 'rotate-90' : ''}`}
                            />
                        </button>

                        {communitiesExpanded && (
                            <div id="communities-list" className="mt-2 space-y-1">
                                <button
                                    onClick={() => {/* TODO: Open create modal */ }}
                                    className="
                                        w-full flex items-center gap-2 px-3 py-2 rounded-lg
                                        text-sm text-gray-600 dark:text-gray-400
                                        hover:bg-gray-100 dark:hover:bg-gray-800
                                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                                        transition-colors
                                    "
                                    aria-label="Create new community"
                                >
                                    <Plus size={16} />
                                    <span>Create Community</span>
                                </button>

                                {/* TODO: Community list will go here */}
                                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-500">
                                    No communities yet
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </nav>

            {/* Footer - User Profile */}
            {!isCollapsed && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                            U
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                User
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                @username
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};
