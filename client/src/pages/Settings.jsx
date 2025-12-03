import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/services/api';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/components/ui/card';
import { Button } from '@/components/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/components/ui/dialog';

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
                    <Card className="mb-4">
                        <CardHeader className="pb-2 pt-3 px-4">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <i className="ri-logout-box-line text-blue-500"></i>
                                Session
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 pt-0">
                            <p className="text-xs text-muted-foreground mb-3">Sign out of your account on this device.</p>
                            <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs">
                                <i className="ri-logout-box-line mr-2"></i>
                                Logout
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="border-red-200 dark:border-red-900">
                        <CardHeader className="pb-2 pt-3 px-4">
                            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600">
                                <i className="ri-error-warning-line"></i>
                                Danger Zone
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 pt-0">
                            <p className="text-xs text-muted-foreground mb-3">
                                Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                            <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)} className="text-xs">
                                <i className="ri-delete-bin-line mr-2"></i>
                                Delete Account
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <i className="ri-error-warning-line"></i>
                            Delete Account
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete your account? This will permanently remove all your data including campaigns, contacts, and sent emails.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDeleteAccount} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Settings;
