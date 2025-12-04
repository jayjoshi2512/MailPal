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

const DeleteCampaignDialog = ({ open, onOpenChange, campaign, onConfirm }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <i className="ri-delete-bin-line text-red-500"></i>
                        Delete Campaign
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete "<strong>{campaign?.name}</strong>"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-700 dark:text-red-400">
                            <i className="ri-error-warning-line mr-2"></i>
                            All campaign data including sent email history will be permanently deleted.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        <i className="ri-delete-bin-line mr-2"></i>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteCampaignDialog;
