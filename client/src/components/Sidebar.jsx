import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/components/ui/separator';
import { Avatar } from '@/components/components/ui/avatar';

const Sidebar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-border/50 bg-background p-4 flex flex-col">
            {/* Profile Picture - Compact */}
            {user && (
                <div className="flex flex-col items-center mb-3">
                    <Avatar
                        src={user.profile_picture}
                        alt={user.name}
                        name={user.name}
                        size="lg"
                    />
                    <p className="mt-1.5 text-xs font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
            )}

            <Separator className="my-3" />

            {/* Top Navigation - Compact */}
            <nav className="flex-1 space-y-1">
                {/* Dashboard */}
                <button 
                    onClick={() => navigate('/dashboard')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm rounded-md transition-colors ${
                        isActive('/dashboard') 
                            ? 'bg-muted text-foreground font-medium' 
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                    <i className="ri-dashboard-line text-base"></i>
                    <span>Dashboard</span>
                </button>

                {/* Campaigns */}
                <button 
                    onClick={() => navigate('/campaigns')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm rounded-md transition-colors ${
                        location.pathname.startsWith('/campaigns')
                            ? 'bg-muted text-foreground font-medium' 
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                    <i className="ri-megaphone-line text-base"></i>
                    <span>Campaigns</span>
                </button>

                {/* Compose */}
                <button 
                    onClick={() => navigate('/compose')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm rounded-md transition-colors ${
                        isActive('/compose') 
                            ? 'bg-muted text-foreground font-medium' 
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                    <i className="ri-mail-send-line text-base"></i>
                    <span>Compose</span>
                </button>
            </nav>

            {/* Bottom Section - Compact */}
            <div className="mt-auto space-y-1">
                <Separator className="mb-3" />
                
                {/* How to Use */}
                <button 
                    onClick={() => navigate('/how-to-use')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm rounded-md transition-colors ${
                        isActive('/how-to-use') 
                            ? 'bg-muted text-foreground font-medium' 
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                    <i className="ri-question-line text-base"></i>
                    <span>How to Use</span>
                </button>

                {/* Settings */}
                <button 
                    onClick={() => navigate('/settings')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm rounded-md transition-colors ${
                        isActive('/settings') 
                            ? 'bg-muted text-foreground font-medium' 
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                    <i className="ri-settings-line text-base"></i>
                    <span>Settings</span>
                </button>

                {/* Profile */}
                <button 
                    onClick={() => navigate('/profile')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm rounded-md transition-colors ${
                        isActive('/profile') 
                            ? 'bg-muted text-foreground font-medium' 
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                    <i className="ri-user-line text-base"></i>
                    <span>Profile</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
