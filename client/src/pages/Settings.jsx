import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/services/api';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { SessionCard, DangerZone, DeleteAccountDialog } from '@/components/Settings';

const Settings = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const response = await authAPI.deleteAccount();
            if (response.success) {
                toast.success('Account deleted successfully');
                logout();
                navigate('/', { replace: true });
            } else {
                toast.error(response.error || 'Failed to delete account');
            }
        } catch (error) {
            toast.error('Failed to delete account');
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            <Navbar />
            <Sidebar />
            <main className="ml-64 mt-16 p-6 flex-1">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-4">
                        <h1 className="text-xl font-semibold">Settings</h1>
                        <p className="text-xs text-muted-foreground">Manage your account</p>
                    </div>
                    <SessionCard onLogout={handleLogout} />
                    <DangerZone onDeleteClick={() => setShowDeleteDialog(true)} />
                </div>
            </main>
            <DeleteAccountDialog 
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDeleteAccount}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default Settings;
