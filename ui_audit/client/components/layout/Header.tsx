import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const Header: React.FC = () => {
    const { currentPersona, logout } = useAuth();

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4 max-w-4xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <h1 className="text-xl font-bold text-gray-900">Community App</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        {currentPersona && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <User className="h-4 w-4" />
                                <span className="font-medium">{currentPersona.displayName}</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {currentPersona.trustLevel}
                                </span>
                            </div>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={logout}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
