import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { ProfileHeader, AccountDetails, ConnectedAccount } from '@/components/Profile';

const Profile = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-background flex">
            <Navbar />
            <Sidebar />
            <main className="ml-64 mt-16 p-6 flex-1">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-4">
                        <h1 className="text-xl font-semibold">Profile</h1>
                        <p className="text-xs text-muted-foreground">Your account information</p>
                    </div>
                    <ProfileHeader user={user} />
                    <AccountDetails user={user} />
                    <ConnectedAccount user={user} />
                </div>
            </main>
        </div>
    );
};

export default Profile;
