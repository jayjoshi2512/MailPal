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
        <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-border/50 bg-background p-6 flex flex-col">
            {/* Profile Picture */}
            {user && (
                <div className="flex flex-col items-center mb-4">
                    <Avatar
                        src={user.profile_picture}
                        alt={user.name}
                        name={user.name}
                        size="xl"
                    />
                    <p className="mt-2 text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
            )}

            <Separator className="my-4" />

            {/* Top Navigation */}
            <nav className="flex-1 space-y-2">
                {/* Dashboard */}
                <button 
                    onClick={() => navigate('/dashboard')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-lg transition-colors ${
                        isActive('/dashboard') 
                            ? 'bg-muted text-foreground font-medium' 
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                    <i className="ri-dashboard-line text-lg"></i>
                    <span>Dashboard</span>
                </button>

                {/* Compose */}
                <button 
                    onClick={() => navigate('/compose')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-lg transition-colors ${
                        isActive('/compose') 
                            ? 'bg-muted text-foreground font-medium' 
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                    <i className="ri-mail-send-line text-lg"></i>
                    <span>Compose</span>
                </button>
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto space-y-2">
                <Separator className="mb-4" />
                
                {/* Settings */}
                <button 
                    onClick={() => navigate('/settings')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-lg transition-colors ${
                        isActive('/settings') 
                            ? 'bg-muted text-foreground font-medium' 
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                    <i className="ri-settings-line text-lg"></i>
                    <span>Settings</span>
                </button>

                {/* Profile */}
                <button 
                    onClick={() => navigate('/profile')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-lg transition-colors ${
                        isActive('/profile') 
                            ? 'bg-muted text-foreground font-medium' 
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                    <i className="ri-user-line text-lg"></i>
                    <span>Profile</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
