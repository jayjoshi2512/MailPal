import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/components/ui/separator';

const Sidebar = () => {
    const { user } = useAuth();

    return (
        <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-border/50 bg-background p-6 flex flex-col">
            {/* Profile Picture */}
            {user?.picture && (
                <img
                    src={user.picture}
                    alt={user.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                />
            )}

            <Separator className="my-4" />

            {/* Settings */}
            <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted rounded-lg">
                <i className="ri-settings-line"></i>
                <span>Settings</span>
            </button>

            {/* Profile */}
            <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted rounded-lg">
                <i className="ri-user-line"></i>
                <span>Profile</span>
            </button>
        </div>
    );
};

export default Sidebar;
