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

const DeleteTemplateDialog = ({ open, onOpenChange, template, onConfirm, isDeleting }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <i className="ri-delete-bin-line"></i>
                        Delete Template
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        Are you sure you want to delete <strong>{template?.name}</strong>?
                        <br />
                        <span className="text-xs text-muted-foreground mt-1 block">
                            This action cannot be undone.
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <><i className="ri-loader-4-line animate-spin mr-2"></i>Deleting...</>
                        ) : (
                            <><i className="ri-delete-bin-line mr-2"></i>Delete</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteTemplateDialog;
