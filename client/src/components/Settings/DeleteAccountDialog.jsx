import React from 'react';
import { Button } from '@/components/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/components/ui/dialog';

const DeleteAccountDialog = ({ open, onOpenChange, onConfirm, isDeleting }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                    <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" size="sm" onClick={onConfirm} disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteAccountDialog;
