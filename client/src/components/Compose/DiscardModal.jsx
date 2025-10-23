import React from 'react';
import { Button } from '@/components/components/ui/button';

/**
 * Modern Discard Confirmation Modal
 * Beautiful modal dialog to replace ugly browser alerts
 */
const DiscardModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-background border border-border rounded-xl shadow-2xl p-6 space-y-6">
                    {/* Icon & Title */}
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <i className="ri-delete-bin-line text-2xl text-red-600 dark:text-red-400"></i>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                Discard Draft?
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Are you sure you want to discard this draft? All your content, recipients, and attachments will be permanently lost. This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={onConfirm}
                            className="px-6 bg-red-600 hover:bg-red-700 text-white"
                        >
                            <i className="ri-delete-bin-line mr-2"></i>
                            Discard
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DiscardModal;
